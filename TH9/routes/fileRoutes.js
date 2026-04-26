const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fileController');

router.get('/sync', ctrl.readSync);
router.get('/async', ctrl.readAsync);

module.exports = router;