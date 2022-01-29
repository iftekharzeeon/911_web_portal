const express = require('express');
const bodyParser = require('body-parser').json();
const userController = require('../controllers/userController');
const serviceController = require('../controllers/serviceController');
const requestController = require('../controllers/requestController');

const router = express.Router();

//User Sign Up
router.post('/api/addUser/', bodyParser, userController.user_create);

//User Sign In
router.post('/api/loginUser/', bodyParser, userController.login_user);

//Get Service List
router.get('/api/getServices/', bodyParser, serviceController.get_services);

//Add Request
router.post('/api/addRequest/', bodyParser, requestController.add_request);

module.exports = router;