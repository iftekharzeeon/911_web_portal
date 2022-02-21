const express = require('express');

const app = express();
const port = 3000;

const server = require('http').Server(app);
const io = require('socket.io')(server);
global.io = io;


const routes = require('./routes/routes');

server.listen(port);
app.use(express.urlencoded({
    extended: true
}));

io.on('connection', () => {
    console.log('a user is connected');
});

//User Routes
app.use('/', routes);
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('./views/index.html', {root: __dirname});
    });

app.get('/citReg', (req, res) => {
    res.sendFile('./views/citReg.html', {root: __dirname});
    });

app.get('/citLogin', (req, res) => {
    res.sendFile('./views/citLogin.html', {root: __dirname});
    });

app.get('/empLogin', (req, res) => {
    res.sendFile('./views/empLogin.html', {root: __dirname});
    });


app.get('/empReg', (req, res) => {
    res.sendFile('./views/empReg.html', {root: __dirname});
    });

app.get('/empLogin/RequestList', (req, res) => {
    res.sendFile('./views/RequestList.html', {root: __dirname});
    });

app.get('/empLogin/empHistory', (req, res) => {
    res.sendFile('./views/empHistory.html', {root: __dirname});
    });

app.get('/careLogin', (req, res) => {
    res.sendFile('./views/careLogin.html', {root: __dirname});
    });

app.get('/citLogin/selectService', (req, res) => {
    res.sendFile('./views/selectService.html', {root: __dirname});
    });

app.get('/citLogin/citProfile', (req, res) => {
    res.sendFile('./views/citProfile.html', {root: __dirname});
    });

app.get('/citLogin/selectLocation', (req, res) => {
    res.sendFile('./views/selectLocation.html', {root: __dirname});
    });

app.get('/citLogin/citChat', (req, res) => {
    res.sendFile('./views/citChat.html', {root: __dirname});
    });

app.get('/citLogin/pendingRequest', (req, res) => {
    res.sendFile('./views/pendingRequest.html', {root: __dirname});
    });

app.get('/careLogin/careChat', (req, res) => {
    res.sendFile('./views/careChat.html', {root: __dirname});
    });
    
app.get('/adminPanel', (req, res) => {
    res.sendFile('./views/adminLogin.html', {root: __dirname});
});

app.get('/adminPanel/adminDashboard', (req, res) => {
    res.sendFile('./views/adminDashboard.html', {root: __dirname});
});

//For testing    
app.get('/googleMap', (req, res) => {
    res.sendFile('./views/google_map.html', {root: __dirname});
    });