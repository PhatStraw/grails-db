const mongoose = require('mongoose');
const Schema = mongoose.Schema

var adminSchema = new Schema({
  username: String,
  password: String
})

var Admin = mongoose.model('admin', adminSchema)


module.exports = Admin
