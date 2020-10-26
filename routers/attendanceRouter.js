const express = require('express');
const attendanceController = require('../controllers/attendanceController');

const router = express.Router();

router.post('/', attendanceController.insertAttendance);
router.put('/', attendanceController.updateAttendance);
router.delete('/', attendanceController.deleteAttendance);

// router.post('/', attendanceController.insertAttendanceValidator, attendanceController.insertAttendance);
// router.put('/', attendanceController.updateAttendanceValidator, attendanceController.updateAttendance);
// router.delete('/', attendanceController.deleteAttendanceValidator, attendanceController.deleteAttendance);


module.exports = router;