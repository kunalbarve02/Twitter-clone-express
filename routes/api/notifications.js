const express = require('express')
const multer = require('multer')
const path = require('path')
const fs  = require('fs')
const app = express()
const router = express.Router()
const decoder = require('../../jwt_decoder')
const Post = require('../../schemas/postSchema')
const User = require('../../schemas/userSchema')
const Notis = require('../../schemas/notificationSchema')
const Chat = require('../../schemas/chatSchema')
const Message = require('../../schemas/messageSchema')
const mongoose  = require('mongoose')

router.get('/',(req,res,next)=>{
    Notis.find({ userTo:req.query.userId , notificationType: { $ne: "message" } })
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt : -1 })
    .then(notifications=>{
        res.send(notifications)
    })
})

router.put('/',(req,res,next)=>{
    Notis.findByIdAndUpdate(req.query.notiId, { opened : true }, {new:true})
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt : -1 })
    .then(notifications=>{
        res.send(notifications)
    })
})

router.put('/markAll',(req,res,next)=>{
    console.log(req.query.userId)
    Notis.updateMany({ userTo:req.query.userId, notificationType: { $ne: "message" } }, {opened: true})
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt : -1 })
    .then((notifications)=>{
        console.log(notifications)
        res.status(204).send()
    })
})

module.exports = router