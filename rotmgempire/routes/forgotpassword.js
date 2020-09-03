const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
const bcrypt = require('bcryptjs')
const puppeteer = require('puppeteer')

router.get('/', function(req, res){
    res.render('forgotpassword/index')
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
        res.render('forgotpassword/index', {erros: erros})
    }else{

        User.findOne({username: req.body.username.toLowerCase()}).then(function(user){
            if(user){
                
                async function scraping2(url){
                    const browser2 = await puppeteer.launch({headless: true})
                    const page2 = await browser2.newPage()
                    await page2.goto(url)
                    await page2.waitFor(0)
                    const result = await page2.evaluate(() => {
                        let json2 = []
                
                        let line = document.getElementsByClassName('line1 description-line')
                        let line2 = document.getElementsByClassName('line2 description-line')
                        let line3 = document.getElementsByClassName('line3 description-line')
                        
                        if(!line[0] || line[0] == typeof undefined || line[0] == null){
                            return json
                        }else{

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
                
                scraping2('https://www.realmeye.com/player/' + user.ign).then(function(starV2){
                    if(starV2[0].code == req.body.verifyhash || starV2[1].code2 == req.body.verifyhash || starV2[2].code3 == req.body.verifyhash){
                    
                        user.password = req.body.newPassword
            
                        bcrypt.genSalt(10, function(erro, salt){
                            bcrypt.hash(user.password, salt, function(erro, hash){
                                if(erro){
                                    req.flash('error_msg', 'An error occurred when we tried to save your new password')
                                    res.redirect('/')
                                }else{
                    
                                    user.password = hash
                    
                                    user.save().then(function(){
                                        req.flash('success_msg', 'New password saved successfully')
                                        res.redirect('/')
                                    }).catch(function(erro){
                                        req.flash('error_msg', 'Error the new password was not created')
                                        res.redirect('/forgotpassword')
                                    })
                                }
                            })
                        })

                    }else{

                        req.flash('error_msg', 'We did not find the realmeye code in your profile')
                        res.redirect('/')

                    }

                }).catch(function(erro){
                    req.flash('error_msg', 'Your realmeye account has no content in the description')
                    res.redirect('/')
                })

            }else{
                
                erros.push({text: 'We did not find any account with that username'})
                res.render('forgotpassword/index', {erros: erros})

            }
        })
    }
})

module.exports = router