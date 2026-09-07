const express = require('express');

const {
    submitExam,
    startExam,
    getMyResults,
    getAllResults,
    getResultById
} = require('../controllers/resultController');

const {
    protect,
    restrictTo
} = require('../middleware/auth');

const router = express.Router();


// =========================================
// START EXAM
// =========================================

router.post(
    '/exam/:examId/start',
    protect,
    restrictTo('student'),
    startExam
);


// =========================================
// SUBMIT EXAM
// =========================================

router.post(
    '/exam/:examId/submit',
    protect,
    restrictTo('student'),
    submitExam
);


// =========================================
// GET MY RESULTS
// =========================================

router.get(
    '/my-results',
    protect,
    restrictTo('student'),
    getMyResults
);


// =========================================
// GET ALL RESULTS
// ADMIN ONLY
// =========================================

router.get(
    '/',
    protect,
    restrictTo('admin'),
    getAllResults
);


// =========================================
// GET ONE RESULT
// ADMIN ONLY
// =========================================

router.get(
    '/:id',
    protect,
    restrictTo('admin'),
    getResultById
);


module.exports = router;