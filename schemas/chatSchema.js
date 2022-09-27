const mongoose = require('mongoose')

const ChatSchema = mongoose.Schema({
    chatName:
    {
        type:String,
        trim:true
    },
    isGroupChat:
    {
        type:Boolean,
        default:false
    },
    users:
    [
        {
            type: mongoose.SchemaTypes.ObjectID,
            ref:'User'
        }
    ]
    ,
    latestMessage:
    {
        type: mongoose.SchemaTypes.ObjectID,
        ref:'Message'
    }
},{
    timestamps: true
})

var Chat = mongoose.model('Chat' , ChatSchema )

module.exports = Chat