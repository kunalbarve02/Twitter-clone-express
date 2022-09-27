const jwt_decode=require('jwt-decode')

const decoder =(token)=>{
    var decoded =jwt_decode(token)

    return decoded
}

module.exports = decoder