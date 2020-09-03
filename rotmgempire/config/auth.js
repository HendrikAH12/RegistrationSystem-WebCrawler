const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('../models/User')
const User = mongoose.model('users')

module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'username', passwordField: 'password'}, function(username, password, done){
        User.findOne({username: username.toLowerCase()}).then(function(user){
            if(!user){
                return done(null, false, {message: 'That username does not exist'})
            }
            bcrypt.compare(password, user.password, function(erro, math){
                if(math){
                    return done(null, user)
                }else{
                    return done(null, false, {message: 'Incorrect password'})
                }
            })
        })
    }))
    passport.serializeUser(function(user, done){
        done(null, user.id)
    })
    passport.deserializeUser(function(id, done){
        User.findById(id , function(erro, user){
            done(erro, user)
        })
    })
}