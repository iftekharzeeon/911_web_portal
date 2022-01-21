const express = require('express');
const bodyParser = require('body-parser').json();
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/api/addUser/', bodyParser, userController.user_create);

module.exports = router;