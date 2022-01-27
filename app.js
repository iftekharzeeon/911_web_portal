const express = require('express');

const routes = require('./routes/routes');

const app = express();
const port = 3000;

app.listen(port);
app.use(express.urlencoded({
    extended: true
}));

//User Routes
app.use('/', routes);
