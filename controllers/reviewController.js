const Review = require('../models/Review')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {
    checkPermissions
} = require('../utils')
const { isValidObjectId } = require('mongoose')

const createReview = async (req, res) =>{

    const { product:productId } = req.body

    // check wheather the productId is valid
    const isValidProduct = await Product.find({_id: productId})
    if(isValidProduct.length == 0){
        throw new CustomError.NotFoundError(`No product with id ${productId}`)
    }

    console.log("validproduct ", isValidProduct)

    // check if user already left a review on a product, in schema we have set complex index for this
    const alreadySubmitted = await Review.findOne({product: productId, user: req.user.userId})

    if(alreadySubmitted){
        throw new CustomError.BadRequestError('Already submitted review for this product')
    }

    req.body.user = req.user.userId
    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({review})
}

// populate method is used to reference documents in other collections, instead of just showing the productId with each review, 
// if we want actual name, and price etc of the product or username instead of userid

// .populate(path:refers to the model we want to refer, select: what values we want from that model)

const getAllReviews = async (req, res) =>{
    const reviews = await Review.find({}).populate({path:'product', select:'name company price'}).populate({path:'user', select:'name'})

    res.status(StatusCodes.OK).json({reviews, count:reviews.length})
}

const getSingleReview = async (req, res) =>{
    const { id:reviewId } = req.params
    const review = await  Review.findOne({_id:reviewId}).populate({path:'product', select:'name company price'})
    if(!review){
        throw new CustomError.BadRequestError(`No review with id ${reviewId}`)
    }
    res.status(StatusCodes.OK).json({review})
}

const updateReview = async (req, res) =>{
    const { id:reviewId } = req.params
    const { rating, title, comment } = req.body
    const review = await Review.findOne({_id:reviewId})
    if(!review){
        throw new CustomError.BadRequestError(`No review with id ${reviewId}`)
    }
    checkPermissions(req.user, review.user)
    review.rating = rating
    review.title = title
    review.comment = comment
    await review.save()
    res.status(StatusCodes.OK).json({review})
}

const deleteReview = async (req, res) =>{
    const { id:reviewId } = req.params
    const review = await Review.findOne({_id: reviewId})
    if(!review){
        throw new CustomError.NotFoundError(`Review with id ${reviewId} not found`)
    }
    checkPermissions(req.user, review.user)
    await review.remove()
    res.status(StatusCodes.OK).json({msg: "Review Deleted"})
}

// unlike the virual 'reviews, we cna query the object here
const getSingleProductReviews = async (req, res) =>{
    const { id:productId } = req.params
    const reviews = await Review.find({product:productId})
    res.status(StatusCodes.OK).json({reviews, count: reviews.length})
}

module.exports = {
    createReview, getAllReviews, getSingleReview, updateReview, deleteReview, getSingleProductReviews
}