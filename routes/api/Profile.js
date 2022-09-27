const express = require('express')
const app = express()
const router = express.Router()
const decoder = require('../../jwt_decoder')
const Post = require('../../schemas/postSchema')
const User = require('../../schemas/userSchema')

router.get("/",(req,res,next)=>{
    User.findById(req.query.id)
    .populate({
        path:'likes',
        model:'Post',
        populate : {
            path:'postedBy',
            model:'User'
        },
    })
    .populate({
        path:"pinned",
        ref:"post",
        populate : {
            path:'postedBy',
            model:'User'
        },
    })
    .then(async(user)=>{
        if(user === null)
        {
            return res.status(400).send({msg:"User not Found"})
        }
        res.send(user)
    })
})

router.put("/follow",(req,res,next)=>{
    console.log(req.query)
})

module.exports = router