const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');
const queries = require('../util/query');
const io = global.io;

const bcrypt = require('bcrypt');
const saltRounds = 10;

let connection;

const get_messages = async (req, res) => {
    let result;

    let responses = {};

    let citizen_id;
    let employee_id;

    let all_msg;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        citizen_id = req.body.citizen_id;
        employee_id = req.body.employee_id;

        result = await connection.execute(queries.getMsgsQuery, [citizen_id, employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        all_msg = result.rows;

        responses.ResponseCode = 1;
        responses.AllMessages = all_msg;

    } catch (err) {
        console.log(err);
        responses.ResponseCode = -1;
        responses.ResponseText = 'Internal Database Error. Oracle Error Number ' + err.errorNum + ', offset ' + err.offset;
        responses.ErrorMessage = err.message;
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
        res.send(responses);
    }
}

const save_messages = async (req, res) => {
    let result;

    let responses = {};

    let citizen_id;
    let employee_id;
    let message_text;
    let sender_id;
    let chat_log_id;
    let receiver_id;
    let receiver_name;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        citizen_id = req.body.citizen_id;
        employee_id = req.body.employee_id;
        message_text = req.body.message_text;
        sender_id = req.body.sender_id;
        receiver_id = req.body.receiver_id;

        let sent_time = new Date();

        //Get Next Chat Log Id
        await syRegister.getNextId(connection, 9).then(function (data) {
            chat_log_id = data;
        });

        //Insert into chat log id
        result = await connection.execute(queries.insertChatLogQuery, [chat_log_id, citizen_id, employee_id, sent_time, message_text, sender_id]);

        connection.commit();

        if (result.rowsAffected) {
            responses.ResponseCode = 1;
            responses.ResponseText = 'Message was sent.';
        } else {
            responses.ResponseCode = 0;
            responses.ResponseText = 'Message could not be sent.';
        }

    } catch (err) {
        console.log(err);
        responses.ResponseCode = -1;
        responses.ResponseText = 'Internal Database Error. Oracle Error Number ' + err.errorNum + ', offset ' + err.offset;
        responses.ErrorMessage = err.message;
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
        io.emit('message', req.body);
        res.send(responses);
    }
}

const get_chat_citizen_list = async (req, res) => {
    let result;

    let responses = {};

    let employee_id;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        employee_id = req.body.employee_id;

        result = await connection.execute(queries.getChatCitizenListQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length) {
            responses.ResponseCode = 1;
            responses.ResponseData = result.rows;
            responses.ResponseText = 'Data Found';
        } else {
            responses.ResponseCode = 0;
            responses.ResponseText = 'No inbox data found';
        }

    } catch (err) {
        console.log(err);
        responses.ResponseCode = -1;
        responses.ResponseText = 'Internal Database Error. Oracle Error Number ' + err.errorNum + ', offset ' + err.offset;
        responses.ErrorMessage = err.message;
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
        res.send(responses);
    }
}

module.exports = {
    get_messages,
    save_messages,
    get_chat_citizen_list
}