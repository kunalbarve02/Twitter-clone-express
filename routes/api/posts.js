const express = require('express')
const app = express()
const router = express.Router()
const decoder = require('../../jwt_decoder')
const Post = require('../../schemas/postSchema')
const User = require('../../schemas/userSchema')
const Notis = require('../../schemas/notificationSchema')

//fetch

router.get("/",async(req,res,next)=>{

    console.log(req.query.id)

    var user = await User.findById(req.query.id)

    Post.find({
        postedBy:user.following
    })
    .populate("postedBy")
    .populate("retweetData")
    .populate("replies")
    .sort({"createdAt":-1})
    .then(async(post)=>{
        post = await User.populate(post, {path:"retweetData.postedBy"})
        post = await User.populate(post, {path:"replies.postedBy"})
        res.send(post)
    })
    .catch((err)=>{
        console.log(err)
    })
})

router.get("/search",(req,res,next)=>{
    let search = req.query.search
    Post.find(
        {
            content : { $regex : search , $options: 'i'}
        }
    )
    .populate("postedBy")
    .populate("retweetData")
    .populate("replies")
    .sort({"createdAt":-1})
    .then(async (post)=>{
        post = await User.populate(post, {path:"retweetData.postedBy"})
        post = await User.populate(post, {path:"replies.postedBy"})
        res.send(post)
    })
})

router.get('/get/tweet/:id', (req,res,next)=>{
    
    console.log(req.params.id)

    Post.findById(req.params.id)
    .populate("postedBy")
    .populate({
        path: 'replies',
        model: 'Post',
        populate: {
            path: 'postedBy',
            model: 'User'
        }
    })
    .then(async (post)=>{

        res.send(post)
    })
})

router.get('/get/tweets/user', (req,res,next)=>{
    
    Post.find({postedBy:req.query.id})
    .populate("postedBy")
    .populate("retweetData")
    .populate("replies")
    .sort({"createdAt":-1})
    .then(async post=>{
        post = await User.populate(post, {path:"retweetData.postedBy"})
        post = await User.populate(post, {path:"replies.postedBy"})
        res.send(post);
    })
    .catch(err=>{
        console.log(err)
    })

})

//create

router.post("/",(req,res,next)=>{
    console.log(req.body.token)
    const token=decoder(req.body.token)
    console.log(token)

    var postData={
        content:req.body.tweetContent,
        postedBy:token.id
    }

    if(req.body.replyTo)
    {
        postData.replyTo = req.body.replyTo
    }

    Post.create(postData)
    .then(async(post)=>{
        console.log(post)
        post = await User.populate(post, {path:"postedBy"})
        post = await Post.populate(post, {path:"replyTo"})
        if(post.replyTo!==undefined)
        {
            await Notis.insertNotification(post.replyTo,postData.postedBy,"reply",post._id)
            await Post.findByIdAndUpdate(post.replyTo, { $addToSet : { replies : post._id } },{ new:true })
        }
        res.status(200).send(post)
    })
    .catch((err)=>{
        console.log(err)
    })
})

//like

router.put("/:postid/:token/like",async (req,res,next)=>{
    let postId = req.params.postid
    console.log(postId)
    let userId = decoder(req.params.token).id
    console.log(userId)

    var user = await User.findById(userId)

    if(user.likes && user.likes.includes(postId))
    {
        await User.findByIdAndUpdate(userId, { $pull : { likes : postId } },{new:true})
        let post = await Post.findByIdAndUpdate(postId, { $pull : { likes : userId } },{new:true})
        post = await User.populate(post, {path:"postedBy"})
        res.status(200).send(post)
    }
    else
    {
        await User.findByIdAndUpdate(userId, { $addToSet : { likes : postId } },{new:true})
        let post = await Post.findByIdAndUpdate(postId, { $addToSet : { likes : userId } },{new:true})
        await Notis.insertNotification(post.postedBy,userId,"like",post._id)
        post = await User.populate(post, {path:"postedBy"})
        res.status(200).send(post)
    }
})

//rewteet

router.post("/:postid/:token/retweet",async (req,res,next)=>{
    let postId = req.params.postid
    console.log(postId)
    let userId = decoder(req.params.token).id
    console.log(userId)

    var deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId })
    .catch((err)=>{
        console.log(err)
    })

    var repost = deletedPost
    var user = await User.findById(userId)

    if(repost === null)
    {
        console.log("No post was deleted")
        repost = await Post.create({ postedBy: userId, retweetData: postId }) 
        .catch((err)=>{
            console.log(err)
        })
    }
    
    if(user.retweets.includes(postId))
    {
        console.log("delete retweet")
        await User.findByIdAndUpdate(userId, { $pull : { retweets : postId} },{new:true})
        .catch((err)=>{
            console.log(err)
        })
        let post = await Post.findByIdAndUpdate(postId, { $pull : { retweetUsers : userId } },{new:true})
        .catch((err)=>{
            console.log(err)
        })
        post = await User.populate(post, {path:"postedBy"})
        res.status(200).send(post)
    }
    else
    {
        await User.findByIdAndUpdate(userId, { $addToSet : { retweets : postId } },{new:true})
        .catch((err)=>{
            console.log(err)
        })
        let post = await Post.findByIdAndUpdate(postId, { $addToSet : { retweetUsers : userId } },{new:true})
        .catch((err)=>{
            console.log(err)
        })
        await Notis.insertNotification(post.postedBy,userId,"retweet",post._id)
        post = await User.populate(post, {path:"postedBy"})
        res.status(200).send(post)
    }
})
module.exports = router