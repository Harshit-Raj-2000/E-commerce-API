const CustomError = require('../errors')
const { isTokenValid } = require('../utils')

const authenticateUser = async (req, res, next) =>{
    const token = req.signedCookies.token
    if(!token){
        throw new CustomError.BadRequestError('Authentication Invalid')
    }

    try{
        const { name, userId, role } = isTokenValid({ token })
        req.user = { name, userId, role}
        next()

    } catch (error){
        throw new CustomError.BadRequestError('Authentication Invalid')
    }

} 

// ... is rest operator used to collect all arguments passed into a function in an array
const authorizePermissions = (...roles) =>{
   return (req, res, next) =>{
       if( !roles.includes(req.user.role) ){
           throw new CustomError.UnauthorizedError('Unauthorized to access this route')
       }
       next()
   }
}


module.exports = {
    authenticateUser,
    authorizePermissions
}