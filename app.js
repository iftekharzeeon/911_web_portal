const express = require('express')
const oracledb = require('oracledb');
const app = express();
const port = 3000;
const password = 'admin';
const user = 'c##911_web_portal';
const connectionString = 'localhost:1521/ORCL';

let connection;
let result;

app.listen(port);
app.use(express.urlencoded(true));

async function getLocations(req, res) {
    try {
        connection = await oracledb.getConnection({
            user: user,
            password: password,
            connectString: connectionString
        });

        console.log('Connected to Database');

        result = await connection.execute('SELECT * FROM location', [], {outFormat: oracledb.OUT_FORMAT_OBJECT});

    } catch(err) {
        console.log(err);
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        } else {
            console.error('Connection not closed');
        }

        if (result.rows.length == 0) {
            res.send('Table is empty');
        } else {
            res.send(result.rows);
        }
    }
};

app.get('/getLocations', (req, res) => {
    getLocations(req, res);
});