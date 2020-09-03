const express = require('express')
const router = express.Router()

router.get('/', function(req, res){
    req.logOut()
    req.flash('success_msg', 'Successfully logged out')
    res.redirect('/')
})

module.exports = router