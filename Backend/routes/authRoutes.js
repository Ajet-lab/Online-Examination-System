const express = require('express');

const {
    login,
    registerStudent,
    getMe,
    logout
} = require('../controllers/authController');

const {
    protect,
    restrictTo
} = require('../middleware/auth');

const router = express.Router();


// =========================================
// LOGIN
// =========================================

router.post('/login', login);


// =========================================
// REGISTER STUDENT
// ADMIN ONLY
// =========================================

router.post(
    '/register-student',
    protect,
    restrictTo('admin'),
    registerStudent
);


// =========================================
// GET CURRENT USER
// =========================================

router.get(
    '/me',
    protect,
    getMe
);


// =========================================
// LOGOUT
// =========================================

router.post(
    '/logout',
    protect,
    logout
);


module.exports = router;