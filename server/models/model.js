const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Model = new mongoose.Schema({
  wallFile: {
    type: String,
    required: false,
    trim: true
  },
  sketchFile: {
    type: String,
    required: true,
    trim: true
  },
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true
  }
});

const ModelSchema = mongoose.model('Model', Model);
module.exports = ModelSchema;