"use strict";
var fs = require('fs');
const LoadConfigs = require("../../LoadConfigs")
const GetMariaDbConnection = require("../jobs/GetMariaDbConnection");
const ApplyTrasformations = require("./ApplyTrasformations");
const stream = require('stream');
const stringify = require('csv-stringify');

async function GenerateCsvsFromSqlQuery(inputs, transformations) {

    const configs = LoadConfigs();

    const dbConnection = await GetMariaDbConnection();

    return new Promise(async (resolve, reject) => {

        try {
            //===================
            // crete temporary folders to hold generated files
            //============================
            var now = new Date();
            var folder_name = now.getFullYear() + "_" + (now.getMonth() + 1) + "_" + now.getDate() + "_" + Date.now();
            var tempFolderToHoldExcels = configs.ROOT_PATH + "/exports/" + folder_name;

            fs.mkdirSync(tempFolderToHoldExcels, { recursive: true });

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

            var queryStream = dbConnection.query(query).stream({highWaterMark: 1000});

            var queryStreamAsyncStreamIterator = queryStream.pipe(new stream.PassThrough({objectMode: true}));


            //===========================
            // creates the stream to write the CDV
            //===========================
            // NOTE: for more documentation on the stringify API for writing/working with csv
            // take a look at: https://csv.js.org/stringify/api/
            // this is the stream to create the csv
          // columns_to_headers should be an array of objects {"key": name_of_the_property_on_record_object, "header": name_of_header_that_you_want}
            var stringifier = stringify.stringify({
                header: true,
                columns: inputs.columns_to_headers,
                delimiter: inputs.delimiter
            });

            //...that will write in the file stream
            stringifier.pipe(writeStream);


            //===========================
            // Iterate on the stream of the query
            //===========================
            for await (var record of queryStreamAsyncStreamIterator) {
                record = ApplyTrasformations(record, transformations);
                stringifier.write(record);
            }

            stringifier.end();


            //===========================
            // handler for when the writes to the csv ends
            //===========================
            writeStream.on('finish', async function () {

                //======================
                // destroy database connection
                //========================
                dbConnection.destroy();


                //===========================
                // returns the file generated
                //===========================
                generatedFiles.push(fileName);
                resolve(generatedFiles);

            });

            //===========================
            // handler for error on th write stream
            //===========================
            writeStream.on('error', function (err) {
                throw err;
            });

        }catch (e){
            reject(e);
        }

    });

}

module.exports = GenerateCsvsFromSqlQuery;
