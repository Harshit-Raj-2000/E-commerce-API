const express = require('express')
const router = express.Router()
const {authenticateUser, authorizePermissions} = require('../middleware/authentication')
const {
    getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword
} = require('../controllers/userController')

// order of middle ware is important, first we authenticate, then we authorize
router.route('/').get(authenticateUser, authorizePermissions('admin'), getAllUsers)

// this route has to be above any route with /:id, as showme will be matched to the id
router.route('/showMe').get(authenticateUser, showCurrentUser)
router.route('/updateUser').patch(authenticateUser, updateUser)
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword)


router.route('/:id').get(authenticateUser, getSingleUser)



module.exports = router
