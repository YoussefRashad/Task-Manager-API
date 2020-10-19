

const express = require('express')
const app = express()
require('./db/mongoose.js')

// Routers Middlewares
const userRouter = require('./routers/user.router')
const taskRouter = require('./routers/task.router')

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.use((req, res)=>{
    res.status(400).send()
})

const PORT = process.env.PORT || 3500
app.listen(PORT, ()=>console.log(`server is up on port ${PORT}`))