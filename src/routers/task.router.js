
const router = require('express').Router()
const Task   = require('../models/task.model')
const auth   = require('../middlewares/auth')

//get All tasks
router.get('/tasks', async (req, res)=>{
    try {
        const tasks = await Task.find({})
        res.send(tasks)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

// get my tasks
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks/me', auth, async (req, res) => {
    const match = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : parts[1] === 'desc' ? -1 : parts[1] === 'DESC'? -1 : 0 
    }
    try {
        // to match user's tasks
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip:  parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

// get a specific task
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

// create a task
router.post('/tasks', auth, async (req, res)=>{
    try {
        const task = new Task({...req.body, owner: req.user._id})
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})
// update a specific task
router.patch('/tasks/:id', auth, async (req,res)=>{
    const updates = Object.keys(req.body) // to get all objects
    const allowedUpdates = ['description', 'completed']

    const isAllowed = updates.every((update)=> allowedUpdates.includes(update))
    if(!isAllowed){
        return res.status(404).send()
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        updates.forEach((update)=> task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

//delete a specific task
router.delete('/tasks/:id', auth, async (req, res)=>{
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})


module.exports = router