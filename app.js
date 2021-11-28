require('dotenv').config()

require('express-async-errors')

// express
const express = require('express')
const app = express()

// rest of the packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')

// security packages
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

// db
const connectDB = require('./db/connect')

// routers
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')

const errorHandlerMiddleware = require('./middleware/error-handler')
const notFoundMiddleware = require('./middleware/not-found')

// security

app.set('trust proxy', 1)
app.use(rateLimiter({
    windowMs:15*60*1000,
    max: 60
}))
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())



// middleware
app.use(morgan('tiny')) // used to log info about incoming requests to the server
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

app.use(express.static('./public'))
app.use(fileUpload())

// routes
app.get('/', (req, res) =>{
    res.send('e-commerce api')
})

// dummy route
app.get('/api/v1', (req, res) =>{
    // console.log(req.cookies)
    console.log(req.signedCookies)
    res.send('e-commerce api')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', orderRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware) // as per express rules, error handler is the last middleware

const port = process.env.PORT || 3000

const start = async (req, res) =>{
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, () =>{
            console.log(`server is running at port ${port}...`)
        })
    } catch (error) {
        console.log(error)
    }
}

start()