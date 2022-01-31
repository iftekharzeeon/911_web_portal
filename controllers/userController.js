const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');

const bcrypt = require('bcrypt');
const saltRounds = 10;

let connection;
let result;

const user_create = async (req, res) => {

    let responses = {};
    console.log(req.body);

    const user = req.body;
    let memberExist = 0;
    let member_id;
    let location_id;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        //Location Info
        block = user.block;
        street = user.street;
        house_no = user.house_no;

        //User Info
        first_name = user.first_name;
        last_name = user.last_name;
        email = user.email;
        phone_number = user.phone_number;
        registration_date = new Date();
        member_type = 1;
        member_password = user.password;

        console.log(user);

        let memberCheckQuery = 'SELECT * FROM member WHERE email = :email';
        memberExist = await connection.execute(memberCheckQuery, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        memberExist = memberExist.rows.length;

        if (memberExist === 0) {

            //Get Next Location Id
            await syRegister.getNextId(connection, 2).then(function (data) {
                location_id = data;
            });

            //Get Next Member Id
            await syRegister.getNextId(connection, 1).then(function (data) {
                member_id = data;
            });

            //Insert Into Location Table
            let insertLocationQuery = 'INSERT INTO location(location_id, block, street, house_no) VALUES(:location_id, :block, :street, :house_no)';

            result = await connection.execute(insertLocationQuery, [location_id, block, street, house_no]);

            //Insert Into Member Table
            let insertMemberQuery = 'INSERT INTO member(member_id, first_name, last_name, email, phone_number, registration_date, member_type, location_id) ' +
                ' VALUES(:member_id, :first_name, :last_name, :email, :phone_number, :registration_date, :member_type, :location_id)';

            result = await connection.execute(insertMemberQuery, [member_id, first_name, last_name, email, phone_number, registration_date, member_type, location_id]);

            //Insert Password Info
            let salt = '';
            let password_key = '';
            salt = bcrypt.genSaltSync(saltRounds);
            password_key = bcrypt.hashSync(member_password, salt);
            let memberPasswordQuery = 'INSERT INTO member_password(member_password_id, member_id, password_key) VALUES(:member_id, :member_id, :password_key)';

            result = await connection.execute(memberPasswordQuery, [member_id, member_id, password_key]);
            connection.commit();

            if (result) {
                if (result.rowsAffected == 1) {
                    responses.ResponseCode = 1;
                    responses.ResponseText = 'New Member Added';
                    responses.MemberId = member_id;
                } else {
                    responses.ResponseCode = -1;
                    responses.ResponseText = 'Something Went Wrong.';
                }
            } else {
                responses.ResponseCode = -1;
                responses.ResponseText = 'Something Went Wrong. Data Could Not Be Inserted';
            }
        } else {
            //Member Not Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Member Already Exists';
        }

    } catch (err) {
        console.log(err);
        res.send(err);
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
        res.send(responses);
    }
};

const login_user = async (req, res) => {
    let responses = {};
    const user = req.body;
    let memberId;
    let memberInfo;
    let passwordKey;
    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        let userEmail = user.email;
        let userPassword = user.password;

        let memberCheckQuery = 'SELECT * FROM member WHERE email = :userEmail';
        memberInfo = await connection.execute(memberCheckQuery, [userEmail], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberInfo.rows.length) {
            memberId = memberInfo.rows[0].MEMBER_ID;
            let passwordCheckQuery = 'SELECT password_key FROM member_password WHERE member_id = :memberId';
            passwordKey = await connection.execute(passwordCheckQuery, [memberId], { outFormat: oracledb.OUT_FORMAT_OBJECT });

            passwordKey = passwordKey.rows[0].PASSWORD_KEY;

            if (bcrypt.compareSync(userPassword, passwordKey)) {
                responses.ResponseCode = 1;
                responses.ResponseText = 'Login Successful';
                responses.MemberId = memberId;
                responses.MemberInfo = memberInfo.rows[0];
            } else {
                //Password Incorrect
                responses.ResponseCode = 0;
                responses.ResponseText = 'Incorrect Password';
            }

        } else {
            //Member Not Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Member Not Found';
        }

    } catch (err) {
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
    user_create,
    login_user
};