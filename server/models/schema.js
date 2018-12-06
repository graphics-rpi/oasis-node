const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
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
      name: String,
      id: String,
      unique: true
    }],
    required: false
  }
});

UserSchema.methods.comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
}

UserSchema.methods.hashPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

UserSchema.methods.hashPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

UserSchema.methods.addModel = (id, name) => {
  UserSchema.findOne({
    id: id,
    name: name
  }, (err, model) => {
    if (model || err) {
      return {
        status: 0,
        message: "model exists"
      };
    } else {
      UserSchema.models.create({
        id: id,
        name: name
      }, (err, model, info) => {
        if (err) {
          return {
            status: 0,
            message: "failed to add model"
          }
        } else if (model) {
          return {
            status: 1,
            message: "model added"
          }
        } else {
          return {
            status: 0,
            message: "not sure what happened"
          }
        }
      });
    }
  });
}

UserSchema.methods.removeModel = (id, name) => {
  UserSchema.models.deleteOne({
    id,
    name
  }, (err) => {
    if (err) {
      return {
        status: 0,
        message: "not deleted"
      }
    } else {
      return {
        status: 1,
        message: "model deleted"
      }
    }
  })
}

const User = mongoose.model('User', UserSchema);
module.exports = User;