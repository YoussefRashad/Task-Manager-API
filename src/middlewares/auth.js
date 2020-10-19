
const jwt  = require('jsonwebtoken')
const User = require('../models/user.model')


const auth = async (req, res, next)=>{
    try { // Bearer ax878asdwe54asdasd7we8qweqwe8a5sd65asdw445qweq6q28f4
        const token = req.header('Authorization').replace('Bearer ', '')
        if (!token) {
            throw new Error({error: "token"})
        }

        const decode = jwt.verify(token, 'thisIsMySignatureTokenCreatedByYoussefRashad')
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }

        // to using in MWs 
        req.token = token
        req.user  = user
        next()
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate!' })
    }
}
module.exports = auth