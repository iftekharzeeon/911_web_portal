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
const ccController = require('../controllers/customerCareController');
const chatController = require('../controllers/chatController');

const router = express.Router();

//User Sign Up
router.post('/api/addUser/', bodyParser, userController.user_create);

//User Sign In
router.post('/api/loginUser/', bodyParser, userController.login_user);

//User Update Info
router.post('/api/updateUserInfo', bodyParser, userController.update_user_info);

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
router.get('/api/getShifts/', bodyParser, shiftController.get_shifts);

//Update Employee Status
router.post('/api/updateEmployeeStatus/', bodyParser, adminController.action_employee);

//Admin Login
router.post('/api/adminLogin/', bodyParser, adminController.admin_login);

//Admin Create
router.post('/api/adminCreate/', bodyParser, adminController.admin_create);

//User Request History
router.post('/api/getUserRequestHistoryList/', bodyParser, userController.user_request_history);

//Employee Request History
router.post('/api/getEmployeeRequestHistoryList/', bodyParser, employeeController.employee_request_history);

//Request History Details
router.post('/api/getRequestHistoryDetails/', bodyParser, requestController.request_history_details);

//Customer Care Login
router.post('/api/customerCareLogin/', bodyParser, ccController.login_cc);

//Customer Care Sign Up
router.post('/api/customerCareSignUp', bodyParser, ccController.cc_register);

//Get All Users
router.get('/api/getAllUsers/', bodyParser, adminController.get_all_users);

//Get All Employees
router.get('/api/getAllEmployees/', bodyParser, adminController.get_all_employees);

//Get All Customer Care
router.get('/api/getAllCustomerCares/', bodyParser, adminController.get_all_customer_care);

//Get All Vehicle
router.get('/api/getAllVehicle/', bodyParser, adminController.get_all_vehicle);

//Get All Unapproved Employee List
router.get('/api/getAllUnapprovedEmployees/', bodyParser, adminController.get_all_unapproved_employees);

//Get Employee Info For Edit
router.post('/api/getEmployeeForEdit/', bodyParser, adminController.get_employee_info_for_edit);

//Update Employee Info
router.post('/api/updateEmployeeInfo/', bodyParser, adminController.update_employee_info);

//Get Request Log
router.get('/api/getRequestLog/', bodyParser, adminController.get_request_log);

//Get Request Details
router.post('/api/getRequestDetails/', bodyParser, adminController.get_request_details);

//Get Ongoing Request Log
router.get('/api/getOngoingRequestLog', bodyParser, adminController.get_ongoing_request_list);

//Get Department Drivers
router.post('/api/getDepartmentDrivers/', bodyParser, adminController.get_department_drivers);

//Add Vehicle
router.post('/api/addVehicle/', bodyParser, adminController.add_vehicle);

//Add Service
router.post('/api/addService/', bodyParser, adminController.add_service);

//Add Department
router.post('/api/addDepartment/', bodyParser, adminController.add_department);

//Add Job
router.post('/api/addJob/', bodyParser, adminController.add_job);

//Get Messages
router.post('/api/getMessages/', bodyParser, chatController.get_messages);

//Send Messages
router.post('/api/sendMessage/', bodyParser, chatController.save_messages);

//Get Citizen Chat List
router.post('/api/getCitizenChatList', bodyParser, chatController.get_chat_citizen_list);

//Get Citizen Request Status
router.post('/api/checkRequestStatus', bodyParser, userController.check_request_status);

//Get Available Customer Care List
router.get('/api/getAvailableCCList', bodyParser, ccController.get_available_cc_list);

module.exports = router;