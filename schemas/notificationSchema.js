const mongoose = require('mongoose')

const notificationSchema = mongoose.Schema({
    userTo:{
        type: mongoose.SchemaTypes.ObjectID,
        ref:'User'
    },
    userFrom:{
        type: mongoose.SchemaTypes.ObjectID,
        ref:'User'        
    },
    notificationType: String,
    opened:{
        type:Boolean,
        default:false
    },
    entityId:mongoose.SchemaTypes.ObjectID
},{
    timestamps: true
})

notificationSchema.statics.insertNotification=async(userTo, userFrom, notificationType, entityId)=>{
    var data = {
        userTo:userTo,
        userFrom:userFrom,
        notificationType:notificationType,
        entityId:entityId
    }
    console.log(data)
    if(notificationType!=="message")
    {
        await Notis.deleteOne(data)
    }
    return Notis.create(data)
}

var Notis = mongoose.model('Notis' , notificationSchema )

module.exports = Notis