//Carregando modulos

const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const register = require('./routes/register')
const login = require('./routes/login')
const logout = require('./routes/logout')
const profile = require('./routes/profile')
const changepassword = require('./routes/changepassword')
const forgotpassword = require('./routes/forgotpassword')
require('./config/auth')(passport)

//Configuracoes
    
    //Sessao

        app.use(session({
            secret: 'rotmgempire',
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())
    
    //Middleware

        app.use(function(req, res, next){
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null
            if(res.locals.user != null){
                res.locals.username = res.locals.user.username
                res.locals.ign = res.locals.user.ign
                res.locals.rp = res.locals.user.rp
            }
            next()
        })
    
    //Body Parser
        
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    //Handlebars
        
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')

    //Mongoose
        
        mongoose.Promise = global.Promise
        mongoose.connect('mongodb://localhost/rotmgempire', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(function(){
            console.log('Connected with mongo')
        }).catch(function(erro){
            console.log('Error connecting: ' + erro)
        })

    //Public
        
        app.use(express.static(path.join(__dirname, 'public')))

    //Rotas

        app.get('/', function(req, res){
            res.render('index')
        })

        app.use('/register', register)
        app.use('/login', login)
        app.use('/logout', logout)
        app.use('/profile', profile)
        app.use('/changepassword', changepassword)
        app.use('/forgotpassword', forgotpassword)
    
    //Outros
        
        const PORT = 8081
        app.listen(PORT, function(){
            console.log('Server running')
        })
