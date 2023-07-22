const mongoose = require('mongoose')


// Define schema of Mongodb
const User = new mongoose.Schema({
    name: { type: String, require: true},
    password: { type: String, require: true},
}, { collection: 'user-data'})

const model = mongoose.model('UserData', User)

module.exports = model;

