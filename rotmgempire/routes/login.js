const express = require('express')
const router = express.Router()
const passport = require('passport')

router.get('/', function(req, res){
    res.render('login/index')
})

router.post('/', function(req, res, next){

    var erros = []

    if(!req.body.username || typeof req.body.username == undefined || req.body.username == null){
        erros.push({text: 'Invalid Username'})
    }

    if(req.body.username.length < 2){
        erros.push({text: 'Invalid Username: min number of characters is 2'})
    }

    if(req.body.username.length > 20){
        erros.push({text: 'Invalid Username: max number of characters is 20'})
    }

    if(!req.body.password || typeof req.body.password == undefined || req.body.password == null){
        erros.push({text: 'Invalid Password'})
    }

    if(req.body.password.length < 6){
        erros.push({text: 'Invalid Password: min number of characters is 6'})
    }

    if(req.body.password.length > 25){
        erros.push({text: 'Invalid Password: max number of characters is 25'})
    }

    if(erros.length > 0){
        res.render('login/index', {erros: erros})
    }else{

        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next)

        req.flash('success_msg', 'Successfully logged in')

    }
})

module.exports = router