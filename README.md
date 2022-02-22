# 911 Web Portal

>911 Web Portal is a web app built for providing emergency services in a town. The app was developed as a part of the Database Project under the course of CSE216 (Database Course).

## Authors
- [@iftekharzeeon](https://github.com/iftekharzeeon)
- [@Shamit187](https://github.com/Shamit187)

## Technologies Used
- NodeJS and ExpressJS [Backend]
- Oracle 19c Database
- Socket io for Real Time chatting
- HTML/CSS/Bootstrap [Frontend]

## Installation
The database used in this app is Oracle 19c Database. If you don't have oracle installed in your system, you need to install it first to run the app in your system. To install Oracle, you can follow the given link below:

[Oracle Installation Guideline for Windows 10](http://www.rebellionrider.com/how-to-install-oracle-database-19c-on-windows-10/)

After completing the installation, you will need to setup the database schema. You can create your own schema and provide the credentials into the ```serverInformation.js``` file located in the root directory. I have given here the snippets for our schema we had created and used. Run them in SQL Plus connected as sysdba.

```
CREATE USER c##911_web_portal IDENTIFIED BY admin;
GRANT CREATE SESSION TO c##911_web_portal;
GRANT ALL PRIVILEGES TO c##911_web_portal;
```
Now you can sign into your schema by providing the credentials you had created.

```
connect c##911_web_portal;
password: admin
```

In this way, your schema will be ready to hold the database tables. I have provided the SQL Dump file in the root directory. Import them into your newly created schema. For database creation and table configuration, I have used Navicat Premium 16.

### Testing
Since database setup is now completed, you are good to go to run and test the app. Clone the app into your system, go to the project directory, open console and run the following commands: 
```
npm install
nodemon app
```
The ```nodemon app``` command will start the server at 3000 port. So make sure your port 3000 is open and not busy, otherwise you can change the port number in the ```app.js``` file.

Go to your web browser and locate [localhost:3000](localhost:3000) to visit the client side of the app. To test the admin panel you can visit [localhost:3000/adminPanel](localhost:3000/adminPanel)

**Client Site** : [localhost:3000](localhost:3000)

**Admin Site** : [localhost:3000/adminPanel](localhost:3000/adminPanel)

## Features

## API Documentation
[API Documentation](https://documenter.getpostman.com/view/13149140/UVeAw9eH)
