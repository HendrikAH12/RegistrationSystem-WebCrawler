const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
const bcrypt = require('bcryptjs')
const puppeteer = require('puppeteer')

router.get('/', function(req, res){
    res.render('register/index')
})

router.post('/', function(req, res){
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

    if(!req.body.ign || typeof req.body.ign == undefined || req.body.ign == null){
        erros.push({text: 'Invalid Ign'})
    }

    if(req.body.ign.length < 1){
        erros.push({text: 'Invalid Ign: min number of characters is 1'})
    }

    if(req.body.ign.length > 10){
        erros.push({text: 'Invalid Ign: max number of characters is 10'})
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

    if(req.body.password != req.body.confirmP){
        erros.push({text: 'Invalid Password: they do not match'})
    }

    if(erros.length > 0){
        res.render('register/index', {erros: erros})
    }

    else{

        User.findOne({username: req.body.username.toLowerCase()}).then(function(user){
            if(user){
                erros.push({text: 'An account with this username already exists'})
                res.render('register/index', {erros: erros})
            }else{
                User.findOne({ign: req.body.ign.toLowerCase()}).then(function(user){
                    if(user){
                        erros.push({text: 'An account with this ign already exists'})
                        res.render('register/index', {erros: erros})
                    }else{

                        async function scraping(url){
                            const browser = await puppeteer.launch({headless: true})
                            const page = await browser.newPage()
                            await page.goto(url)
                            await page.waitFor(0)
                            const result = await page.evaluate(() => {
                                let json = []
                                
                                
                                let dnexist = document.getElementsByClassName('player-not-found')
                                if(!dnexist[0] || dnexist[0] == typeof undefined || dnexist[0] == null){
                                    return json
                                }else{
                                    json.push({
                                        'dnexist': dnexist[0].textContent
                                    })
                                        
                                    return json
                                }
                            })
                            browser.close()
                            return result
                        }

                        scraping('https://www.realmeye.com/player/' + req.body.ign).then(function(starV){
                            if(starV[0].dnexist == "haven't seen " + '"' + req.body.ign + '"' + " yet,or " + '"' + req.body.ign + '"' + " has a private profileor " + '"' + req.body.ign + '"' + "'s name has changed."){

                                req.flash('error_msg', 'This rotmg account does not exist')
                                res.redirect('/')
                            }
                        }).catch(function(erro){
                            
                            async function scraping2(url){
                                const browser2 = await puppeteer.launch({headless: true})
                                const page2 = await browser2.newPage()
                                await page2.goto(url)
                                await page2.waitFor(0)
                                const result = await page2.evaluate(() => {
                                    let json2 = []
                            
                                    let getstar = document.getElementsByClassName('star-container')
                                    let line = document.getElementsByClassName('line1 description-line')
                                    let line2 = document.getElementsByClassName('line2 description-line')
                                    let line3 = document.getElementsByClassName('line3 description-line')
                                    
                                    if(!line[0] || line[0] == typeof undefined || line[0] == null){
                                        return json
                                    }else{
                                        json2.push({
                                            'star': getstar[0].textContent
                                        })
    
                                        json2.push({
                                            'code': line[0].textContent
                                        })
                                        
                                        json2.push({
                                            'code2': line2[0].textContent
                                        })
                                
                                        json2.push({
                                            'code3': line3[0].textContent
                                        })
                                        
                                        return json2
                                    }

                                })
                                browser2.close()
                                return result
                            }

                            scraping2('https://www.realmeye.com/player/' + req.body.ign).then(function(starV2){
                                if(starV2[0].star > 9){
                                    
                                    if(starV2[1].code == req.body.verifyhash || starV2[2].code2 == req.body.verifyhash || starV2[3].code3 == req.body.verifyhash){
                                        
                                        const newUser = new User({
                                            username: req.body.username.toLowerCase(),
                                            ign: req.body.ign.toLowerCase(),
                                            password: req.body.password
                                        })
                                
                                        bcrypt.genSalt(10, function(erro, salt){
                                            bcrypt.hash(newUser.password, salt, function(erro, hash){
                                                if(erro){
                                                    req.flash('error_msg', 'Error to save the account')
                                                    res.redirect('/')
                                                }else{
                                
                                                    newUser.password = hash
                                
                                                    newUser.save().then(function(){
                                                        req.flash('success_msg', 'Account successfully created')
                                                        res.redirect('/')
                                                    }).catch(function(erro){
                                                        req.flash('error_msg', 'Error to create the account')
                                                        res.redirect('/register')
                                                    })
                                                }
                                            })
                                        })
    
                                    }else{
    
                                        req.flash('error_msg', 'We did not find the realmeye code in your profile')
                                        res.redirect('/')
    
                                    }
       
                                }else{
                                    if(starV2[0].star < 10){
                                    req.flash('error_msg', 'The rotmg account do not have 10 stars')
                                    res.redirect('/')
                                    }
                                }
                            }).catch(function(erro){
                                req.flash('error_msg', 'Your realmeye account has no content in the description')
                                res.redirect('/')
                            })
                        })
                    }
                })
            }
        }).catch(function(erro){
            req.flash('error_msg', 'An error occurred while verifying the information')
            res.redirect('/')
        })

    }

})

router.get('/info', function(req, res){
    res.render('register/info')
})

module.exports = router