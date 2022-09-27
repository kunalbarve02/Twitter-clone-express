const mongoose = require('mongoose')

const PostSchema = mongoose.Schema({
    content: {
        type:String,
        trim:true
    },
    postedBy: {
        type: mongoose.SchemaTypes.ObjectID,
        ref:'User'
    },
    likes: [
        {
            type: mongoose.SchemaTypes.ObjectID,
            ref:'User'
        }
    ],
    retweetUsers: [
        {
            type: mongoose.SchemaTypes.ObjectID,
            ref:'User'
        }
    ],
    retweetData:{
        type: mongoose.SchemaTypes.ObjectID,
        ref:'Post'
    },
    replyTo:{
        type: mongoose.SchemaTypes.ObjectID,
        ref:'Post'
    },
    replies:[
        {
            type: mongoose.SchemaTypes.ObjectID,
            ref:'User'
        }
    ],
    pinnedBy:[
        {
            type: mongoose.SchemaTypes.ObjectID,
            ref:'User'
        }
    ]
},{
    timestamps: true
})

var Post = mongoose.model('Post',PostSchema)

module.exports = Post