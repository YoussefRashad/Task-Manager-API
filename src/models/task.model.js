
// packages
const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
    description:{
        type: String,
        required: true,
        trim: true
    },
    completed:{
        type: Boolean,
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId, // to store user ID
        required: true,
        ref:'User'
    }
},{
    timestamps: true // to using it when i wanna sorting by sortBy query
})

const taskModel = mongoose.model('Task', taskSchema)

module.exports = taskModel