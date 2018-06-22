'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');
const expect = chai.expect;

const {app, runServer, closeServer} = require('../server');
const {User} = require('../models');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedUserData() {
  console.log('seedng user profiles');
  const seedData = [];

  for (let i = 0; i < 5; i++) {
    seedData.push(generateUser());
  };
  // console.log(seedData);
  return User.insertMany(seedData);
}

function generateUser() {
  // console.log('generating user data');
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    userName: faker.internet.userName(),
    password: faker.internet.password(),
    email: faker.internet.email()
    // orders: []
  };
};

function generateArtSample() {
  return {
    imgA: "url(`"+faker.image.imageUrl()+"`)",
    imgB: "url(`"+faker.image.imageUrl()+"`)"
  }
}



function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}
// const testOrder = generateOrder();
// console.log(testOrder.people[0].orders[0]);


describe('API tests', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedUserData();

  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });



  describe('GET 1 user endpoint', function() {
    it('should return a specific user', function() {
      let findUser = {};
      return User
        .findOne()
        .then(function(res) {
          findUser = res;
          // console.log(res);
          return chai.request(app)
            .get(`/user/${res._id}`)
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(findUser.userName).to.equal(`${res.body.userName}`);
        });
    });
  });

  describe('GET 1 user by username and password endpoint', function() {
    it('should return a specific user', function() {
      let findUser = {};
      return User
        .findOne()
        .then(function(res) {
          findUser = res;
          return chai.request(app)
            .get(`/user/${res.userName}/${res.password}`)
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(findUser.userName).to.equal(res.body.userName);
          expect(findUser.password).to.equal(res.body.password);

        });
    });
  });


  describe('POST user endpoint', function() {
    it('should add a new user to DB', function() {
      const newUser = generateUser();

      return chai.request(app)
        .post('/new-user')
        .send(newUser)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.id).to.not.be.null;
          expect(res.body).to.include.keys(
            'fullName', 'userName', 'password', 'email', 'id');
        });
    });
  });

  describe('PUT save image to users gallery', function() {
    it('should add art to users profile', function() {
        const testArt = generateArtSample();

        return User
          .findOne()
          .then(function(res) {
            // console.log(res._id)
            testArt.id = res._id;
            // console.log(testArt);
            // console.log('testOrder');
            return chai.request(app)
              .put(`/save-image/${testArt.id}`)
              .send(testArt)
          })
          .then(function(res) {
            console.log(res.body);
            expect(res).to.have.status(200);
            return User.findById(testArt.id);
          })
    });
  });

  describe('DELETE user', function() {
    it('should delete a single user by id', function() {
      let user;

      return User
        .findOne()
        .then(function(res) {
          user = res;
          return chai.request(app).delete(`/user/${user._id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return User.findById(user._id);
        })
        .then(function(res) {
          expect(res).to.be.null;
        });
    });
  });

});
