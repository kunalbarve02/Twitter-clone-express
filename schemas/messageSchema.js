const mongoose = require('mongoose')

const MessageSchema = mongoose.Schema({
    sender : {
        type: mongoose.SchemaTypes.ObjectID,
        ref:'User'
    },
    content : {
        type:String,
        trim:true
    },
    chat: {
        type: mongoose.SchemaTypes.ObjectID,
        ref:'Chat'
    },
    readBy: [
        {
            type: mongoose.SchemaTypes.ObjectID,
            ref:'User'
        }
    ]
},{
    timestamps: true
})

var Message = mongoose.model('Message' , MessageSchema )

module.exports = Message