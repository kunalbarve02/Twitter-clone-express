const jwt = require('jsonwebtoken')

exports.requireLogin=(req,res,next)=>{

    const token = req.get('bearer');


    if(token === "null")
    {
        res.sendStatus(202)
    }
    else
    {
        try{
            const decoded = jwt.verify(token,'kunalbarve')

            req.user = decoded

            next()
        }catch(e){
            res.send("Token is invalid")
        }
    }
}