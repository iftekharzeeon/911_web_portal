const express = require('express');
const bodyParser = require('body-parser').json();
const userController = require('../controllers/userController');

const router = express.Router();

//User Sign Up
router.post('/api/addUser/', bodyParser, userController.user_create);

//User Sign In
router.post('/api/loginUser/', bodyParser, userController.login_user);

module.exports = router;