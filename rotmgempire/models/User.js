const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema({
    username:{
        type: String,
        required: true
    },
    ign:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    rp:{
        type: Number,
        default: 0
    }
})

mongoose.model('users', User)