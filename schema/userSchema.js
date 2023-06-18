const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username:String,
    email:String,
    password:String,
    active:Boolean,
    isAdmin:Boolean
})

module.exports = mongoose.model('users', userSchema)