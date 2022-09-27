const express = require('express')
const app = express()
const router = express.Router()
var User = require('../schemas/userSchema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post("/",(req,res,next)=>{
    var userData = req.body.userData

    User.findOne({username:userData.username})
    .then((user)=>{
        if(!user)
        {
            return res.send({msg: "User does not exist"})
        }
        bcrypt.compare(userData.password,user.password)
        .then((isMatch)=>{
            if(!isMatch)
            {
                return res.send({msg:"Passwords don't match"})
            }
            else
            {
                jwt.sign(
                    {id: user.id},
                    'kunalbarve',
                    {expiresIn: 24*3600},
                    (err,token)=>{
                        if(err) throw err
                        res.send(
                            {
                                token,
                                user:{
                                    id: user.id,
                                    username: user.username,
                                    email: user.email,
                                    profilepic : user.profilePic
                                },
                                msg:"User Successfully logged-in"
                            }
                        )
                    }
                )
            }
        })
    })
    .catch((err)=>{
        console.log(err)
    })
})

module.exports = router