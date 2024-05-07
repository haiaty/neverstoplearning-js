"use strict";

const mariadb = require('mariadb')
const path = require("path");
const process = require("process");
const config = require(path.resolve(process.cwd(), "config"))


var connection = mariadb.createPool(
    {
        connectionLimit : 10,
        host: config.DB_TEST_HOST,
        port: config.DB_TEST_PORT,
        user: config.DB_TEST_USERNAME,
        password: config.DB_TEST_PASSWORD,
        database: config.DB_TEST_DATABASE,
        multipleStatements: true
    }
);



module.exports = {
    query: function (query, payload) {

        return new Promise(function (resolve, reject) {
            connection.query(query, payload,
                function (error, results, fields) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }

                }
            );
        });

    },
    connection: connection
};
