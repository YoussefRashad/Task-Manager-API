
const router = require('express').Router()
const multer = require('multer')
const User   = require('../models/user.model')
const auth   = require('../middlewares/auth')

//get all user
router.get('/users', async (req, res)=>{
    try {
        const users = await  User.find({})
        res.send(users)
    } catch (error) {
        res.status(500).send({error: error})
    }
})

//get my profile
router.get('/users/me', auth, async (req, res)=>{    
    res.send(req.user)
})

//create a user
router.post('/users', async (req, res)=>{
    try {
        const user = new User({...req.body})
        const token = await user.generateAuthToken()

        // we don't need this saving operation, it aleardy did in above step
        //await user.save()

        res.status(201).send(user)
    } catch (error) {
        res.status(500).send({error: error.message})
    }
})

//login
router.post('/users/login', async (req, res)=>{
    try {
        const user  = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.status(200).send({user, token})

    } catch (error) {
        res.status(500).send({ error })
    }
})
// to logout from an device
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// to logout from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


//update a user
router.patch('/users/me', auth, async (req, res)=>{
    const updates = Object.keys(req.body) // to get all objects
    const allowedUpdates = ['name', 'age', 'email','password']

    const isAllowed = updates.every((update)=> allowedUpdates.includes(update))
    if(!isAllowed){
        throw new Error()
    }

    try {
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        
        res.send(req.user)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})
//delete a user
router.delete('/users/me', auth, async (req, res)=>{
    try {
        await req.user.remove()
        res.send(user)
    } catch (error) {
        res.status(500).send({ error })
    }
})

/*** upload my avatar pic ***/

const upload = multer({
    limits: { fileSize: 1000000000},
    fileFilter(req, file, CB){
        if (!file.originalname.match(/\.(jpg|JPG|png|PNG|jpeg|JPEG)$/)){
            return CB(new Error('Please upload an image'))
        }
        return CB(null, true)
    }
})
// upload an avatar to a user
router.post('/users/me/avatar', auth, upload.single('image'), async (req,res)=>{
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(404).send({ error: error.message })
})

// get an avatar to a specific user
router.get('/users/:id/avatar', async (req, res)=>{
    const _id = req.params.id
    try {
        const user = await User.findOne({_id})
        if (!user || !user.avatar) {
            throw new Error()
        } 
        res.set('Content-Type', 'image/jpg') // to render image to FE
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

// delete my avatar
router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})



module.exports = router