const express = require('express');
const appFuncs = require('../controllers/applicationController');

const router = express.Router();

router.post('/submitapplication/submit',  appFuncs.submitApplication);
router.get('/applicationstatus/:studentId', appFuncs.getApplicationStatus);
router.get('/applications', appFuncs.getAllApplications);
router.put("/applications/approve/:id", appFuncs.approveApplication);
router.put("/applications/reject/:id", appFuncs.rejectApplication);
module.exports = router;
