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


ReviewSchema.statics.calculateAverageRating = async function(productId){
    const result = await this.aggregate([
        {$match:{product:productId}},
        {$group: {
            _id: null,
            averageRating:{$avg: '$rating'},
            numOfReviews: {$sum: 1}
        }}
    ])
    try {
        await this.model('Product').findOneAndUpdate({_id:productId}, {
            averageRating : Math.ceil(result[0]?.averageRating || 0),
            numOfReviews : result[0]?.numOfReviews|| 0
        })
    } catch (error) {
        console.log(error)
    }
}



// called when we create and update
ReviewSchema.post('save', async function(){
    await this.constructor.calculateAverageRating(this.product)
})

// called when we remove review
ReviewSchema.post('remove', async function(){
    await this.constructor.calculateAverageRating(this.product)
})


// wehen we do reviewSchema.methods.functions, such as comparePassword, we are creating instance methods, where we can call this function after geting an object of Model Review
// we also have static methods which can be called on the Model Review

module.exports = mongoose.model('Review', ReviewSchema)