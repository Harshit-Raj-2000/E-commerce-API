const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const customError = require('../errors')
const path = require('path')

const getAllProducts = async (req, res) =>{
    const products = await Product.find({}).populate({path:'user', select:'name'})
    res.status(StatusCodes.OK).json({products, count: products.length})
}

const createProduct = async (req, res) =>{
    req.body.user = req.user.userId
    const product = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({product})
}

// alternative to setting up virtual of reviews, if we want to query them, we can set up a controller in reviewController and then set it up in productRoutes, or we can import the Review model here
const getSingleProduct = async (req, res) =>{
    const { id:productId } = req.params
    const product = await Product.findOne({_id:productId}).populate('reviews')
    if(!product){
        throw new customError.NotFoundError(`Product with id ${productId} not found`)
    }
    res.status(StatusCodes.OK).json({product})

}

const updateProduct = async (req, res) =>{
    const { id:productId } = req.params
    const product = await Product.findOneAndUpdate({_id: productId}, req.body, {
        new: true,
        runValidators: true
    })
   if(!product){
        throw new customError.NotFoundError(`Product with id ${productId} not found`)
    }
    res.status(StatusCodes.OK).json({product})
}

const deleteProduct = async (req, res) =>{
    const { id:productId } = req.params
    const product = await Product.findOne({_id:productId})
    if(!product){
         throw new customError.NotFoundError(`Product with id ${productId} not found`)
    }


    // when we remove a product, all its reviews must also be deleted
    // we can set this functionality using 'delete hook'
    // unlike deleteall, remove triggers this hook
    await product.remove()
    res.status(StatusCodes.OK).json({msg: "product deleted"})
}

const uploadImage = async (req, res) =>{

    if(!req.files){
        throw new customError.BadRequestError('No File Uploaded')
    }

    const productImage = req.files.image
    if( !productImage.mimetype.startsWith('image')){
        throw new customError.BadRequestError('Please upload image')
    }

    const maxSize = 1024*1024;

    if(productImage.size > maxSize){
        throw new customError.BadRequestError('Please upload image smaller than 1MB')
    }

    const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`)

    await productImage.mv(imagePath)
    res.status(StatusCodes.OK).json({image:`/uploads/${productImage.name}`})
}

module.exports = {
    getAllProducts, createProduct, getSingleProduct, updateProduct, deleteProduct, uploadImage
}

// if we want to get all the reviews associated with a product, since there is no connection bwtween reviews and product, as we do not ave a field called reviews in ProductSchema, we use mongoose virtuals

// mongoose virtuals can be thought of as properties that do not persist, or are stored in the database, they only exist in the logic

// we create them on the fly, when we want to compute something