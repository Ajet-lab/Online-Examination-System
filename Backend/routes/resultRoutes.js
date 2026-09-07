```javascript
const express = require('express');

const {
    submitExam,
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
// Students no longer need access to results.
// This route is intentionally disabled by the
// frontend and will not be used.


/*


router.get(
    '/my-results',
    protect,
    restrictTo('student'),
    getMyResults
);


*/


// =========================================
// GET ALL RESULTS
// =========================================

router.get(
    '/',
    protect,
    restrictTo('admin'),
    getAllResults
);


// =========================================
// GET ONE RESULT
// =========================================

router.get(
    '/:id',
    protect,
    restrictTo('admin'),
    getResultById
);


module.exports = router;
```
