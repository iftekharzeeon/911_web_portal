const express = require('express');
const bodyParser = require('body-parser').json();
const userController = require('../controllers/userController');
const serviceController = require('../controllers/serviceController');
const requestController = require('../controllers/requestController');
const employeeController = require('../controllers/employeeController');
const vehicleController = require('../controllers/vehicleController');
const departmentController = require('../controllers/departmentController');
const jobController = require('../controllers/jobController');
const shiftController = require('../controllers/shiftController');
const adminController = require('../controllers/adminController');

const router = express.Router();

//User Sign Up
router.post('/api/addUser/', bodyParser, userController.user_create);

//User Sign In
router.post('/api/loginUser/', bodyParser, userController.login_user);

//Get Service List
router.get('/api/getServices/', bodyParser, serviceController.get_services);

//User Add Request
router.post('/api/addRequest/', bodyParser, requestController.add_request);

//Get Request Employee Info
router.post('/api/getEmployeeRequestInfo/', bodyParser, employeeController.get_employee_request_info);

//Employee Accept Request
router.post('/api/acceptRequest/', bodyParser, requestController.accept_request);

//Employee Login
router.post('/api/loginEmployee/', bodyParser, employeeController.login_employee);

//Employee Finish Request
router.post('/api/finishRequest/', bodyParser, requestController.finish_request);

//User Get Request Info
router.post('/api/getCitizenRequestInfo/', bodyParser, userController.get_user_request_info);

//Add Vehicle Request
router.post('/api/addVehicleRequest/', bodyParser, vehicleController.add_vehicle_to_the_request);

//Employee Sign Up
router.post('/api/addEmployee/', bodyParser, employeeController.employee_register);

//Get Service Departments
router.post('/api/getServiceDepartments/', bodyParser, departmentController.get_departments_service_wise);

//Get Department Jobs
router.post('/api/getDepartmentJobs/', bodyParser, jobController.get_jobs_department_wise);

//Get Shifts
router.post('/api/getShifts/', bodyParser, shiftController.get_shifts);

//Update Employee Status
router.post('/api/updateEmployeeStatus/', bodyParser, adminController.action_employee);

//Admin Login
router.post('/api/adminLogin/', bodyParser, adminController.admin_login);

//Admin Create
router.post('/api/adminCreate/', bodyParser, adminController.admin_create);

module.exports = router;