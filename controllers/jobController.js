const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');
const queries = require('../util/query');

let connection;

const get_jobs_department_wise = async (req, res) => {

    let result;

    let responses = {};
    
    const department = req.body;

    let department_id;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        department_id = department.department_id;
        
        result = await connection.execute(queries.getDepartmentJobQuery, [department_id], {outFormat: oracledb.OUT_FORMAT_OBJECT});

        if (result) {
            responses = result.rows;
        }

    } catch(err) {
        console.log(err);
        res.send(err);
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
        res.send(responses);
    }
}

module.exports = {
    get_jobs_department_wise
}