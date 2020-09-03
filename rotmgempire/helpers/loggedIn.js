module.exports = {
    loggedIn: function(req, res, next){
        if(req.user){
            return next()
        }
        req.flash('error_msg', 'You must be logged in to access this page')
        res.redirect('/')
    }
}