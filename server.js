const express = require('express')      // Main Imports
const mongoose = require('./Database')


const app = express()
   
const server = app.listen(3001,()=>{                                       // server Conncection
    console.log("Joined Server")
})

var cors = require("cors")
var bodyParser = require('body-parser')                     //Middlewares
var jsonParser = bodyParser.json()
const middleware = require('./middelware')
app.use(bodyParser.json());                                 // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false }))

app.use(cors({origin:"http://localhost:3000", credentials:true}))             //cors


const loginRoute = require('./routes/loginRoute')           //Routes
const registerRoute = require('./routes/registerRoute')      

const postRoute = require('./routes/api/posts')             //api
const profileRoute = require('./routes/api/Profile')
const userRoute = require('./routes/api/user')
const messagesRoute = require('./routes/api/messages')
const chatRoute = require('./routes/api/chat')
const notificationsRoute = require('./routes/api/notifications')


app.use('/login',loginRoute)
app.use('/register',registerRoute)

app.use('/api/posts',postRoute)
app.use('/api/profile',profileRoute)
app.use('/api/user',userRoute)
app.use('/api/messages',messagesRoute)
app.use('/api/chat',chatRoute)
app.use('/api/notis',notificationsRoute)


app.get('/',middleware.requireLogin, (req,res,next)=>{      // redirection
    res.sendStatus(200)
})

