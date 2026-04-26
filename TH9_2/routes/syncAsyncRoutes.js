const express = require('express');
const router = express.Router();
const syncAsyncController = require('../controllers/syncAsyncController');

router.get('/heavy-sync', syncAsyncController.heavySync);
router.get('/heavy-async', syncAsyncController.heavyAsync);

module.exports = router;