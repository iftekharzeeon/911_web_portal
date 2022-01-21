const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');

const bcrypt = require('bcrypt');
const saltRounds = 10;

let connection;
let result;

 const user_create = async (req, res) => {
    const user = req.body;
    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        location_id = 14;
        block = user.block;
        street = user.street;
        house_no = user.house_no;

        let query = 'INSERT INTO location(location_id, block, street, house_no) VALUES(:location_id, :block, :street, :house_no)';

        result = await connection.execute(query, [location_id, block, street, house_no]);
        connection.commit();

        member_id = 103;
        first_name = user.first_name;
        last_name = user.last_name;
        email = user.email;
        phone_number = user.phone_number;
        registration_date = new Date();
        member_type = 1;
        member_password = user.password;

        query = 'INSERT INTO member(member_id, first_name, last_name, email, phone_number, registration_date, member_type, location_id) ' + 
                    ' VALUES(:member_id, :first_name, :last_name, :email, :phone_number, :registration_date, :member_type, :location_id)';

        
        result = await connection.execute(query, [member_id, first_name, last_name, email, phone_number, registration_date, member_type, location_id]);
        connection.commit();

        let salt = '';
        let password_key = '';
        salt = bcrypt.genSaltSync(saltRounds);
        password_key = bcrypt.hashSync(member_password, salt);
        query = 'INSERT INTO member_password(member_password_id, member_id, password_key) VALUES(:member_id, :member_id, :password_key)';
        
        result = await connection.execute(query, [member_id, member_id, password_key]);
        connection.commit();

    } catch(err) {
        console.log(err);
        res.send(err);
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
        if (result) {
            if (result.rowsAffected == 1) {
                res.send('Success');
            } else {
                res.send('Failure');
            }
        } else {
            res.send('Failure');
        }

    }
};

module.exports = {
    user_create
};