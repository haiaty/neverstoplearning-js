/**

libraries:
 "csv-stringify": "^6.2.2",
"mysql": "^2.18.1"

*/


"use strict";
var fs = require('fs');
const LoadConfigs = require("../../LoadConfigs")
const GetMariaDbConnection = require("../jobs/GetMariaDbConnection");
const ApplyTrasformations = require("./ApplyTrasformations");
const stream = require('stream');
const stringify = require('csv-stringify');
const SetLoggedUserId = require("../jobs/SetLoggedUserId");

async function GenerateCsvsFromSqlQuery(inputs, transformations) {

    const configs = LoadConfigs();

    const dbConnection = await GetMariaDbConnection();

    // if inputs has user_id set a query for logged user id
    // because some queries has functions and triggers
    // that uses the user_id for some logic
    if(inputs.hasOwnProperty("user_id")) {
        await SetLoggedUserId(dbConnection, inputs['user_id']);
    }

    return new Promise(async (resolve, reject) => {

        try {
            //===================
            // crete temporary folders to hold generated files
            //============================
            var now = new Date();
            var folder_name = now.getFullYear() + "_" + (now.getMonth() + 1) + "_" + now.getDate() + "_" + Date.now();
            var tempFolderToHoldExcels = configs.ROOT_PATH + "/exports/" + folder_name;
            fs.mkdirSync(tempFolderToHoldExcels);

            //================
            // define Csv file name
            //====================
            var generatedFiles = [];
            var fileName = tempFolderToHoldExcels + "/report.txt";

            //==============
            // create the stream to write to the file
            //=================
            var writeStream = fs.createWriteStream(fileName);


            //=================
            // SET QUERY IN STREAM MODE
            //===================
            var query = inputs.query;


            // this is the stream that gets the data
            // from database
            var queryStream = dbConnection.query(query).stream({highWaterMark: 1000});

            // NOTE: for more documentation on the stringify API for writing/working with csv
            // take a look at: https://csv.js.org/stringify/api/

            var queryStreamAsyncStreamIterator = queryStream.pipe(new stream.PassThrough({objectMode: true}));

            // this is the stream to create the csv
            var stringifier = stringify.stringify({
                header: true,
                columns: inputs.headers,
                delimiter: inputs.delimiter
            });

            //...that will write in the file stream
            stringifier.pipe(writeStream);


            for await (var record of queryStreamAsyncStreamIterator) {
                record = ApplyTrasformations(record, transformations);
                stringifier.write(record);
            }

            stringifier.end();


            writeStream.on('finish', async function () {


                generatedFiles.push(fileName);

                //======================
                // destroy database connection
                //========================
                dbConnection.destroy();

                resolve(generatedFiles);

            });

            writeStream.on('error', function (err) {
                throw err;
            });

        }catch (e){
            reject(e);
        }

    });

}

module.exports = GenerateCsvsFromSqlQuery;
