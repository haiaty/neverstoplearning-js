"use strict";

const mysql = require('mysql')

 async function GetMariaDbConnection(configs) {


    try {
        var connection = mysql.createConnection({
            host: configs.DB_HOST,
            user: configs.DB_USER,
            password: configs.DB_PASSWORD,
            database: configs.DB_DATABASE
        });

        await testConnection(connection);

        return connection;
    } catch(e) {
        throw e;
    }

 }

 async function testConnection(connection) {
    return new Promise((resolve, reject) => {
        connection.connect(function(err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
 }

 module.exports = GetMariaDbConnection;
