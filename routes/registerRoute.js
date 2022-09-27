const express = require('express')
const app = express()
const router = express.Router()
var bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
var jsonParser = bodyParser.json()
const jwt = require('jsonwebtoken')
//const bcrypt = require('bcryptjs')
var User = require('../schemas/userSchema')

router.get("/",(req,res,next)=>{
    res.send("Register")
})

router.post('/',async(req,res,next)=>{
    var userData = req.body.userData

    var user = await User.findOne({
        $or: [
            {username: userData.username},
            {email: userData.email}
        ]
    })
    .catch((err)=>{
        console.log(err)
        res.send("Something went wrong")
    })
    console.log(user)
    if(user == null)
    {   
       userData.password = await bcrypt.hash(userData.password,10)
        userData.passwordConf = await bcrypt.hash(userData.passwordConf,10)

        /*await bcrypt.genSalt(10, (err,salt)=>{
            if(err) throw err
            return bcrypt.hash(userData.password,salt,(err,hash)=>{
                console.log("password ",hash)
                userData.password = hash
            })
        })

        await bcrypt.genSalt(10, (err,salt)=>{
            if(err) throw err
            bcrypt.hash(userData.passwordConf,salt,(err,hash)=>{
                console.log("password Conf ",hash)
                userData.passwordConf = hash
            })
        })*/


        await User.create(userData)
        .then((doc)=>{
            console.log("user created")
            jwt.sign(
                {id: doc.id},
                'kunalbarve',
                {expiresIn: 24*3600},
                (err,token)=>{
                    if(err) throw err
                    res.send(
                        {
                            token,
                            user:{
                                id: doc.id,
                                username: doc.username,
                                email: doc.email,
                                profilepic : doc.profilePic
                            },
                            msg:"User Successfully registered"
                        }
                    )
                }
            )
        })
        .catch((err)=>{
            console.log(err)
        })
    }
    else
    {
        if(userData.email === user.email)
        {
            res.send({msg:"E-mail already in use. Please try another one."})
        }
        else
        {
            res.send({msg:"Username already in use. Please try another one."})
        }
    }
})

module.exports = router