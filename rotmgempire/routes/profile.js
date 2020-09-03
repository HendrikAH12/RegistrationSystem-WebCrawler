const express = require('express')
const router = express.Router()
const {loggedIn} = require('../helpers/loggedIn')

router.get('/', loggedIn, function(req, res){
    res.render('profile/index')
})

module.exports = router