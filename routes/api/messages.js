const express = require('express')
const multer = require('multer')
const path = require('path')
const fs  = require('fs')
const app = express()
const router = express.Router()
const decoder = require('../../jwt_decoder')
const Post = require('../../schemas/postSchema')
const User = require('../../schemas/userSchema')
const mongoose  = require('mongoose')


router.get("/",async(req,res,next)=>{
    res.status(200).send()
})

module.exports = router