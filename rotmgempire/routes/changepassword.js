const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
const bcrypt = require('bcryptjs')
const {loggedIn} = require('../helpers/loggedIn')

router.get('/', loggedIn, function(req, res){
    res.render('changepassword/index')
})

router.post('/', loggedIn, function(req, res){

    var erros = []

    if(!req.body.password || typeof req.body.password == undefined || req.body.password == null){
        erros.push({text: 'Invalid Password'})
    }

    if(req.body.password.length < 6){
        erros.push({text: 'Invalid Password: min number of characters is 6'})
    }

    if(req.body.password.length > 25){
        erros.push({text: 'Invalid Password: max number of characters is 25'})
    }

    if(!req.body.newPassword || typeof req.body.newPassword == undefined || req.body.newPassword == null){
        erros.push({text: 'Invalid New Password'})
    }

    if(req.body.newPassword.length < 6){
        erros.push({text: 'Invalid New Password: min number of characters is 6'})
    }

    if(req.body.newPassword.length > 25){
        erros.push({text: 'Invalid New Password: max number of characters is 25'})
    }

    if(req.body.newPassword != req.body.newPasswordC){
        erros.push({text: 'Invalid New Password: they do not match'})
    }

    if(erros.length > 0){
        res.render('changepassword/index', {erros: erros})
    }else{      
        
        User.findOne({username: req.body.username}).then(function(user){

            bcrypt.compare(req.body.password, user.password, function(erro, math){
                if(math){
                    
                    user.password = req.body.newPassword
            
                    bcrypt.genSalt(10, function(erro, salt){
                        bcrypt.hash(user.password, salt, function(erro, hash){
                            if(erro){
                                req.flash('error_msg', 'An error occurred when we tried to save your new password')
                                res.redirect('/')
                            }else{
                
                                user.password = hash
                
                                user.save().then(function(){
                                    req.flash('success_msg', 'Password successfully changed')
                                    res.redirect('/')
                                }).catch(function(erro){
                                    req.flash('error_msg', 'Error the new password was not created')
                                    res.redirect('/changepassword')
                                })
                            }
                        })
                    })

                }else{
                    
                    erros.push({text: 'Incorrect password'})
                    res.render('changepassword/index', {erros: erros})
                    
                }
            })
        })    
    }
})

module.exports = router