'use strict';

const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const userSchema = mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  userName: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
  created: {type: Date, default: Date.now},
  id: {type: String, default: uuidv4()},
  gallery: [{
    imgA: String,
    imgB: String
  }]
});

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim()
});


userSchema.methods.serialize = function() {
  return {
    firstName: this.firstName,
    fullName: this.fullName,
    userName: this.userName,
    password: this.password,
    email: this.email,
    created: this.created,
    id: this._id,
    gallery: this.gallery
  };
};

const User = mongoose.model('User', userSchema);

module.exports = {User};
