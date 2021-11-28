const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: [true, 'Please provide product name'],
        maxlength: [100, 'Name can not be more than 100 characters']
    },
    price:{
        type: Number,
        required: [true, 'Please provide product price'],
        default:0,
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'],
        maxlength: [1000, 'Description can not be more than 1000 characters']
    },
    image:{
        type: String,
        default: 'uploads/example.jpeg'
    },
    category:{
        type: String,
        required: [true, 'Please provide product category'],
        enum: ['office', 'kitchen', 'bedroom']
    },
    company:{
        type: String,
        required: [true, 'Please provide product company'],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message:'{VALUE} is not supported'
        }
    },
    colors:{
        type: [String],
        required: true,
        default:['#222']
    },
    featured:{
        type: Boolean,
        default: false
    },
    freeShipping:{
        type: Boolean,
        default: false
    },
    inventory:{
        type: Number,
        required: true,
        default: 15
    },
    averageRating:{
        type: Number,
        default: 0
    },
    numOfReviews:{
        type: Number,
        default: 0
    },
    user:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {timestamps: true , toJSON:{virtuals:true}, toObject: { virtuals: true}} )

ProductSchema.virtual('reviews', {
    ref: 'Review',
    localField:'_id',
    foreignField: 'product',
    justOne: false,
    // match: {rating : 5}
})

ProductSchema.pre('remove', async function(next){
    await this.model('Review').deleteMany({product: this._id})
})

// 'reviews' is just a name we used, it could be any name, we are then telling the logic of how to populate reviews, refer Reviewmodel,
// the localfield of Product _id is connected with the foreign foeld of product of Review, and we don't want just a single entity 

// match is used to specify and filter the type of rating we want

// reviews is a virtual property so we can't query it, we'll just get all the reviews on the basis of what we put in ProductSchema.virtual

module.exports = mongoose.model('Product', ProductSchema)