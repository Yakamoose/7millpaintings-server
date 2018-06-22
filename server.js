'use strict';

const express = require('express');
// const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {User} = require('./models');


const app = express();
// app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


// app.use(
//     cors({
//         origin: CLIENT_ORIGIN
//     })
// );
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  // res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // res.header('Access-Control-Allow-Origin', 'GET');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

  next();
});

app.get('/users', (req, res) => {
  User
    .find()
    .then(users => {
      res.json(users.map(
          (user) => user.serialize())
      );
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.get('/user/:id', (req, res) => {
  User
    .findById(req.params.id)
    .then(user => res.json(user.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.get('/user/:userName/:password', (req, res) => {
  // console.log(req.params);
  User
    .findOne({userName: req.params.userName, password: req.params.password })
    .then(user => {
      if(user != null) {
      res.json(user.serialize());
    } else {
      res.json({message: 'user not found'});
    }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    })
})

app.post('/new-user', (req, res) => {
  // console.log('req.body');
  // console.log(req.body);

  const requiredFields = ['firstName', 'lastName', 'userName', 'password', 'email'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    };
  };

  User
    .findOne({userName: req.body.userName, password: req.body.password })
    .then(user => {
      // console.log(user);
      if(user === null) {
        User
          .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            password: req.body.password,
            email: req.body.email
          })
          .then(user => res.status(201).json(user.serialize()))
          .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
          });
        } else {
          res.json({message: 'User already exists'});
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      })
});

app.put('/save-image/:id', (req, res) => {

  let toUpdate = req.body;
  let updateId = req.params.id;

  User
    .findById(updateId)
    .then(function(user) {

      user.gallery.push(toUpdate);
      toUpdate = user.gallery;

      User
        .findByIdAndUpdate(updateId, { $set: {gallery: toUpdate}}, {new: true})
        .then(user => res.status(200).json(user.serialize()))
        .catch(err => {
          console.error('error' + err);
          res.status(500).json({ message: 'Internal server error 1' });
        });
        return toUpdate;
    })
    .catch(err => {
      console.error('error' + err);
      res.status(500).json({ message: 'Internal server error 2' });
    });
})

app.delete('/user/:id', (req, res) => {
  User
  .findByIdAndRemove(req.params.id)
  .then(post => res.status(204).end())
  .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

// app.use('*', function (req, res) {
//   console.log('uh oh');
//   res.status(404).json({ message: 'Not Found' });
// });

let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    console.log('Starting server');
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          console.log('in error');
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = { app, runServer, closeServer };
