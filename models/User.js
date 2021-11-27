const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please provide name'],
        minlength: 3,
        maxlength: 50,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        required:[true, 'Please provide email'],
        validate:{
            validator: validator.isEmail,
            message: 'Please provide valid email'
        }
        // match : regex -- now we can use a package for this
        // validate is an option mongoose provides to set up custom validator functions, instead of createing our own functons, we use validator package and its isEmail function
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6
    },
    role:{
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
   
})

// we can't use arrow functions here, as we use this keyword
UserSchema.pre('save', async function(){
    // console.log(this.modifiedPaths())
    // console.log(this.isModified('name'))
    if( !this.isModified('password')) return //if password is not modified return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}


module.exports = mongoose.model('User', UserSchema)