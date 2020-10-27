const express = require('express');
const attendanceController = require('../controllers/attendanceController');

const router = express.Router();

router.get('/', attendanceController.getAllAttendance);
router.get('/:id', attendanceController.getByAttendanceIdValidator, attendanceController.getByAttendanceId);
router.post('/', attendanceController.insertAttendanceValidator, attendanceController.insertAttendance);
router.put('/:id', attendanceController.updateAttendanceValidator, attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendanceValidator, attendanceController.deleteAttendance);

module.exports = router;