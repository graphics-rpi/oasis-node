const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = new mongoose.Schema({
  email: {
    type: String,
    unique: false,
    required: false,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  models: {
    type: [{
      name: String
    }],
    required: false
  },
  simulations: {
    type: [{
      model: String,
      name: String
    }],
    required: false
  }
});

User.methods.comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
}

User.methods.hashPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

const UserSchema = mongoose.model('User', User);
module.exports = UserSchema;