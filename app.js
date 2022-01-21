const express = require('express');
const oracledb = require('oracledb');

const userRoutes = require('./routes/userRoutes');

const app = express();
const port = 3000;

app.listen(port);
app.use(express.urlencoded({
    extended: true
}));

//User Routes
app.use('/', userRoutes);
