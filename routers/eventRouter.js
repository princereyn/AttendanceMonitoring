const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/search', eventController.searchEventsValidator, eventController.searchEvents);
router.get('/export/:id', eventController.exportEventAttendeesValidator, eventController.exportEventAttendees);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getByEventIdValidator, eventController.getByEventId);
router.post('/', eventController.insertEventValidator, eventController.insertEvent);
router.put('/:id', eventController.updateEventValidator, eventController.updateEvent);
router.delete('/:id', eventController.deleteEventValidator, eventController.deleteEvent);

module.exports = router;