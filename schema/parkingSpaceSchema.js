const mongoose = require('mongoose')

const parkingSpaceSchema = mongoose.Schema({
    id:Number,
    taken:Boolean,
    license:String,
    user:String
})

module.exports = mongoose.model('parking', parkingSpaceSchema)