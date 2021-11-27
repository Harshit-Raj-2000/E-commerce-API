const mongoose = require('mongoose')


const ReviewSchema = new mongoose.Schema({
    rating:{
        type: Number,
        min: 1,
        max: 5,
        required:[true, 'Please provide rating']
    },
    title:{
        type: String,
        trim: true,
        required: [true, 'Please provide review title'],
        maxlength: 100
    },
    comment: {
        type: String,
        required: [true, 'Please provide review text']
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true
    }
}, { timestamps: true})

// compund index, so that one user can comment on have only one review on a product
// one one combination of one user and one product is allowed

ReviewSchema.index({product:1, user: 1}, {unique: true})
// user can leave only one review per product

module.exports = mongoose.model('Review', ReviewSchema)