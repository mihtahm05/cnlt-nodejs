const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');

router.post('/login', ctrl.login);
router.get('/profile', ctrl.profile);
router.get('/logout', ctrl.logout);

module.exports = router;