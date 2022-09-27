const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    FirstName: {
        type:String,
        required:true,
        trim:true
    },
    LastName: {
        type:String,
        required:true,
        trim:true
    },
    username: {
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    email: {
        type:String,
        reqired:true,
        trim:true,
        unique:true
    },
    password: {
        type:String,
        required:true,
        
    },
    passwordConf: {
        type:String,
        required:true
    },
    profilePic: {
        type:String,
        default:'https://res.cloudinary.com/kunalbarve/image/upload/v1629434967/TwitterClone/twitter-avi-gender-balanced-figure_qc6gdd.png'
    },
    coverPic: {
        type:String,
        default:''
    },
    bio: {
        type:String,
        default:''
    },
    followers:[
        {
            type: mongoose.SchemaTypes.ObjectID,
            ref:'User'
        }
    ],
    following:[
        {
            type: mongoose.SchemaTypes.ObjectID,
            ref:'User'
        }
    ],
    likes: [
        {
            type: mongoose.SchemaTypes.ObjectID,
            ref:'Post'
        }
    ],
    retweets: [
        {
            type: mongoose.SchemaTypes.ObjectID,
            ref:'Post'
        }
    ],
    pinned:[
        {
            type: mongoose.SchemaTypes.ObjectID,
            ref:'Post'
        }
    ]
},{
    timestamps: true
})

var User = mongoose.model('User' , UserSchema )

module.exports = User