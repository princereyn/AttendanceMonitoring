const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/search', eventController.searchEventsValidator, eventController.searchEvents);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getByEventIdValidator, eventController.getByEventId);
router.post('/', eventController.insertEventValidator, eventController.insertEvent);
router.put('/', eventController.updateEventValidator, eventController.updateEvent);
router.delete('/', eventController.deleteEventValidator, eventController.deleteEvent);

module.exports = router;