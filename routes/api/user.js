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
const mongoose  = require('mongoose')

require('dotenv').config()


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    }
  })

var upload = multer({ storage: storage })

router.get("/search",async(req,res,next)=>{
    let search = req.query.search
    console.log(search)
    let post = await User.find(
        {
            $or:[
                {FirstName : { $regex : search , $options: 'i'}},
                {LastName : { $regex : search , $options: 'i'}},
                {username : { $regex : search , $options: 'i'}}
            ]
        }
    )
    .catch(err => 
        console.log(err)    
    )
    res.send(post)
})

router.put("/follow",async(req,res,next)=>{

    var userId = req.query.userId
    var toFollow = req.query.toFollow

    var user = await User.findById(userId)

    if(user === null) return res.status(404).send()

    var isFollowing = user.following && user.following.includes(toFollow)

    if(isFollowing)
    {

        user = await User.findByIdAndUpdate(toFollow, { $pull : { followers : userId } }, { new: true } )
        await User.findByIdAndUpdate(userId, { $pull : { following : toFollow } }, { new: true } )
    
        return res.send(user)
    }
    else 
    {
        await Notis.insertNotification(toFollow,userId,"follow",userId)
        user = await User.findByIdAndUpdate(toFollow, { $addToSet : { followers : userId } }, { new: true } )
        await User.findByIdAndUpdate(userId, { $addToSet : { following : toFollow } }, { new: true } )

        return res.send(user)

    }
})

router.get("/followinfo",async(req,res,next)=>{
    var userID = req.query.userID

    var user = await User.findById(userID)

    if(user.followers === undefined)
    {
        user.followers = []
    }
    else if(user.following === undefined)
    {
        user.following = []
    }
    else
    {
        user = await User.populate(user, {path:"following"})
        user = await User.populate(user, {path:"followers"})
    }
    res.send(user)
})

router.post("/upload/profilepic",upload.single("image"),(req,res,next)=>{

    console.log(req.body.userId)

    if(!req.file)
    {
        console.log(req.file)
        return res.status(400).send()
    }

    var filepath = `/uploads/profilepictures/${req.file.filename}.png`
    var tempPath = req.file.path
    var targetPath = path.join(__dirname, `../../${filepath}`)

    fs.rename(tempPath,targetPath,async(err)=>{
        if(err)
        {
            console.log(err)
            return res.status(400).send()
        }
        await User.findByIdAndUpdate( req.body.userId , { profilePic:req.file.filename }, {new:true} )
        .catch(err=>{console.log(err)})
        res.status(204).send()
    })
})

router.post("/upload/coverpic",upload.single("image"),(req,res,next)=>{

    console.log(req.body.userId)

    console.log("coverpic")

    if(!req.file)
    {
        console.log(req.file)
        return res.status(400).send()
    }

    var filepath = `/uploads/coverpics/${req.file.filename}.png`
    var tempPath = req.file.path
    var targetPath = path.join(__dirname, `../../${filepath}`)

    fs.rename(tempPath,targetPath,async(err)=>{
        if(err)
        {
            console.log(err)
            return res.status(400).send()
        }
        await User.findByIdAndUpdate( req.body.userId , { coverPic:req.file.filename }, {new:true} )
        .catch(err=>{console.log(err)})
        res.status(204).send()
    })
})

router.get('/profilepic/:path', (req,res,next)=>{
    let imgpath = req.params.path
    res.sendFile(path.join(__dirname,"../../uploads/profilepictures/"+imgpath+".png"))
})

router.get('/coverpic/:path', (req,res,next)=>{
    let imgpath = req.params.path
    res.sendFile(path.join(__dirname,"../../uploads/coverpics/"+imgpath+".png"))
})

router.put('/pintweet', async(req,res,next)=>{

    let user = await User.findById(req.query.userId)
    if(user.pinned.includes(req.query.tweetId))
    {
        user = await User.findByIdAndUpdate(req.query.userId,{ $pull: { pinned:req.query.tweetId } },{ new:true })
        await Post.findByIdAndUpdate(req.query.tweetId,{ $pull: { pinnedBy:req.query.userId } },{ new:true })
        res.send(user)
    }
    else
    {
        user = await User.findByIdAndUpdate(req.query.userId,{ $addToSet: { pinned:req.query.tweetId } },{ new:true })
        await Post.findByIdAndUpdate(req.query.tweetId,{ $addToSet: { pinnedBy:req.query.userId } },{ new:true })
        res.send(user)
    }
})

module.exports = router