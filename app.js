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
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('./views/index.html', {root: __dirname});
    });

app.get('/citReg', (req, res) => {
    res.sendFile('./views/citReg.html', {root: __dirname});
    });