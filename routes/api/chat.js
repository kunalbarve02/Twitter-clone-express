const express = require('express')
const multer = require('multer')
const path = require('path')
const fs  = require('fs')
const app = express()
const router = express.Router()
const decoder = require('../../jwt_decoder')
const Post = require('../../schemas/postSchema')
const User = require('../../schemas/userSchema')
const Chat = require('../../schemas/chatSchema')
const Notis = require('../../schemas/notificationSchema')
const Message = require('../../schemas/messageSchema')
const mongoose  = require('mongoose')


router.get("/",async(req,res,next)=>{
    Chat.find({ users: { $elemMatch: { $eq: req.query.userId } } })
    .sort({ updatedAt: -1 })
    .populate("latestMessage")
    .populate("users")
    .then(async chats=>{
        chats = await User.populate(chats, {path:"latestMessage.sender"})
        res.send(chats)
    }) 
    .catch((err)=>{
        console.log(err)
    })
}) 

router.post("/",async(req,res,next)=>{
    let chatId = req.body.chatId
    let content = req.body.content
    let sender = req.body.sender

    var newMessage = {
        sender : sender,
        content  : content,
        chat : chatId
    } 

    Message.create(newMessage)
    .then(async message=>{ 
        message = await Message.populate(message, {path:"sender"})

        Chat.findByIdAndUpdate( chatId, { latestMessage : message._id } )
        .then(chat=>{
            chat.users.map(async user=>{
                console.log(typeof user)
                if(user!=newMessage.sender)
                {
                    await Notis.insertNotification(user,newMessage.sender,"message",chat._id)
                }
            })
        })
        .catch(err=>console.log(err))

        res.status(201).send(message)
    })
    .catch(err=>console.log(err))
})

router.post("/create",async(req,res,next)=>{
    if(!req.body.users)
    {
        return res.sendStatus(400).send()
    }

    let users = []

    await req.body.users.map(user=>{
        users.push(user._id)
    })

    await users.push(req.body.userId)

    if(users.length === 0)
    {
        return res.sendStatus(400).send()
    }

    Chat.create({
        users:users,
        isGroupChat : true
    })
    .then(chat=>{
        res.send(chat)
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get("/:chatid",async(req,res,next)=>{
    let chatId = req.params.chatid
    let userid = req.query.userid

    const isValid = mongoose.isValidObjectId(chatId)
    const isUserValid = mongoose.isValidObjectId(chatId)

    let userFound = await User.findById(userid)

    if(!isValid)
    {
        return res.status(400).send()
    }
    let chat = await Chat.findOne({_id:chatId, users:{ $elemMatch: { $eq: userid } } })
    .populate("users")
    .catch(err=>console.log(err))
    if(chat===null)
    {
        if(userFound!==null && isUserValid)
        {
            chat = await getChatbyUserId(userFound._id,chatId)
        }  
    }
    if (chat===null)
    {
        return res.sendStatus(401).send()
    }
    let messages = await Message.find({ chat: chatId })
    .populate("sender")
    .catch(err=>{console.log(err);})
    res.send({chat:chat,messages:messages})
})

router.put("/:chatid/changename",async(req,res,next)=>{
    let newChatName = req.query.chatName
    let chatid = req.params.chatid

    let chat = await Chat.findByIdAndUpdate(chatid,{ chatName : newChatName },{new:true})
    
    res.send(chat)
})


const getChatbyUserId=(userId,otherUserId)=>{

    return Chat.findOneAndUpdate({
        isGroupChat:false,
        users:{
            $size:2,
            $all:[
                { $elemMatch: { $eq: mongoose.Types.ObjectId(userId) } },
                { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } }
            ]
    }
    },
    {
        $setOnInsert:{
            users: [userId,otherUserId]
        }
    },
    {
        new:true,
        upsert:true
    }
    )
    .populate("users")
}

module.exports = router