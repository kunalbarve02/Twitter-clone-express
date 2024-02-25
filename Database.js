const mongoose = require('mongoose')

class Database {
    
    constructor(){
        this.connect()
    }

    connect(){
        mongoose.connect('mongodb+srv://Admin:admin@twitterclone.2lb28.mongodb.net/TwitterClone?retryWrites=true&w=majority',{
        useNewUrlParser:true,
        useUnifiedTopology: true,
        useFindAndModify:false,
        useCreateIndex: true
        })                                                   //Database Connection                              
        .then((res)=>{
            console.log("Database Connection Successful")
        })
        .catch((err)=>{
            console.log(err)
        })
    }
}

module.exports = new Database()