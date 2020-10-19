
// packages
const mongoose  = require('mongoose')
const validator = require('validator')
const bcrypt    = require('bcryptjs')
const jwt       = require('jsonwebtoken')


const userSchema =  mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    age:{
        type: Number,
        default: 18,
        validate(val){
            if(val < 17){
                throw new Error('age must be more than or equal 18')
            }
        }
    },
    email:{
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        unique: true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error('email not valid')
            }
        }
    },
    password:{
        type: String,
        trim: true,
        required: true,
        minlength: 8,
        validate(val){
            if(val.toLowerCase().includes('password')){
                throw new Error("check password's validate ")
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    avatar:{
        type: Buffer
    }
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function(next){
    const user = this
    const userObject = user.toObject()

    // to hide an info when send data
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

// to generate a Authentication Token when login or create account
userSchema.methods.generateAuthToken = async function(next){
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisIsMySignatureTokenCreatedByYoussefRashad')

    user.tokens = [...user.tokens, {token}]
    await user.save()

    return token
}

// to check a Credentials using email and pass
userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch){
        throw new Error('Unable to login')
    }
    return user
}

// convert text plain password to hash password
userSchema.pre('save', async function(next){
    const user = this
    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User