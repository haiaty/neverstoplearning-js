/*

EXAMPLE OF USAGE:
first require: 

const DBDriver =  require(path.resolve(appRoot.path, "backend_of_frontend", "src", "drivers", "db"));

then 

// select
 let db = await DBDriver.connect();
let users = await db.query("SELECT * FROM users");
 console.log(users);

// update or insert
db.runStatement("UPDATE tbl SET name = ? WHERE id = ?", "bar", 2);


 */



"use strict";

const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const appRoot = require("app-root-path");
const dbFilePath =  path.resolve(appRoot.path, "db", "easytask.db");
var db;

function openDatabase() {
    return new Promise(function(resolve, reject){
        // The default value is OPEN_READWRITE | OPEN_CREATE | OPEN_FULLMUTEX.
        db = new sqlite3.Database(dbFilePath,  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the easytask database.');
        });

        resolve(db);
    });
}

function runStatement(query, params) {

    return new Promise(function(resolve, reject) {
            db.run(query, params, function(err) {

                if(err) {
                    reject(err);
                }

                resolve(db);
            });

    });
}

function all(query, params) {

    return new Promise(function(resolve, reject) {
        db.all(query, params, function(err, rows) {

            if(err) {
                reject(err);
            }
            resolve(rows);
        });

    });
}


module.exports = {

    connect: async function () {
        let db = await openDatabase();
        return this;
    },
    runStatement: async function (query, params) {
        await runStatement(query, params);
    },

    query: async function(sql, params) {
        let rows = await all(sql, params);
        return rows;
    }

};


