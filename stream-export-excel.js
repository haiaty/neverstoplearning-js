/*

usage example:

node '{"query": "select * from huge_table", "sheet_headers":['id', 'name'], "max_num_rows_per_sheet": 5, ""max_num_rows_per_file":5, "save_to_path": "myarchive.zip" }


*/


"use strict";
const exceljs = require('exceljs')
var fs = require('fs');
const LoadConfigs = require("../../LoadConfigs")
const GetMariaDbConnection = require("../jobs/GetMariaDbConnection");
const ApplyTrasformations = require("./ApplyTrasformations");
const stream = require('stream');


async function GenerateExcelsFromSqlQuery(inputs, transformations) {

    const configs = LoadConfigs();

    const dbConnection = await GetMariaDbConnection();

    return new Promise(async (resolve, reject) => {
        //===================
        // crete temporary folders to hold generated excels
        //============================
        var now = new Date();
        var folder_name = now.getFullYear() + "_"+ (now.getMonth()+ 1) + "_" + now.getDate() + "_" + Date.now();
        var tempFolderToHoldExcels = configs.ROOT_PATH + "/exports/" + folder_name;
        fs.mkdirSync(tempFolderToHoldExcels);

        //=================
        // SET QUERY IN STREAM MODE
        //===================
        var query = inputs.query;


        // this is the stream that gets the data
        // from database
        var queryStream = dbConnection.query(query).stream({highWaterMark: 1000});

        // we passthrough the querystream because the querystream is not async iterable. Indeed
        // I've got the error: TypeError: finalStream is not async iterable
        // so we passthrough in order to have an async iterable and we can use the 'for await'
        // Why do we need an async iterable stream? Because in order to close the workbook
        // we need to call an async function otherwise it won't work correctly.
        var finalStream = queryStream.pipe(new stream.PassThrough({objectMode: true}));

        // use to stop the final stream otherwise it will be not be closed and will hang up
        queryStream.on('end', async function () {
            finalStream.emit('end');
        });


        //================
        // create first excel
        //================
        // this variable is going to hold
        // all the generated files in order
        // to be able to generate the zip file
        // at the end of the stream of the query
        var generatedExcelFiles = [];

        // this variable is going to track
        // all the lines that have been written
        // in all the excels been generated
        var currentRecordsWrittenOverall = 0;

        // this one is going to keep track
        // of the current file number. It is used
        // to create the excel name, which is dinamyc because
        // we don't know how many excels will be created

        var currentFileNumber = 1;
        var currentFileName = tempFolderToHoldExcels + "/report_" + currentFileNumber + ".xlsx";

        var options = {
            filename: currentFileName,
            useStyles: true,
            useSharedStrings: false,
        }
        var workbook = new exceljs.stream.xlsx.WorkbookWriter(options);

        //=================
        // start populating the first sheet
        //===================
        var currentSheetNumber = 1;
        var currentSheetName = 'sheet_' + currentSheetNumber;
        var sheet = workbook.addWorksheet(currentSheetName);

        // add headers
        sheet.addRow(inputs.sheets_headers).commit();
        currentRecordsWrittenOverall++;


        var numOfRecordsWrittenOnCurrentSheet = 1; //it starts from 1 because we have written the headers
        var numOfRecordsWrittenOnCurrentFile = 1;//it starts from 1 because we have written the headers


        // stream async iterable - see here for more info: https://ljn.io/posts/async-stream-handlers
        for await (var record of finalStream) {

            //===========================
            // apply transformations on record before write it in the excel
            //==========================
            record = ApplyTrasformations(record, transformations);
            //===========================
            // Verify if a new file should be created
            //==========================
            if(numOfRecordsWrittenOnCurrentFile === inputs.max_num_rows_per_file) {

                sheet.commit();
                await workbook.commit();
                generatedExcelFiles.push(currentFileName);
                currentFileNumber++;
                currentFileName = tempFolderToHoldExcels + "/report_" + currentFileNumber + ".xlsx";

                options = {
                    filename: currentFileName,
                    useStyles: true,
                    useSharedStrings: false,
                }

                workbook = new exceljs.stream.xlsx.WorkbookWriter(options);

                //reset the sheet counter
                currentSheetNumber = 1;
                currentSheetName = 'sheet_' + currentSheetNumber;
                sheet = workbook.addWorksheet(currentSheetName);

                //add first row
                sheet.addRow(inputs.sheets_headers).commit();
                currentRecordsWrittenOverall++;

                numOfRecordsWrittenOnCurrentSheet = 1;
                numOfRecordsWrittenOnCurrentFile = 1;


                //add the current record to the sheet
                sheet.addRow(Object.values(record)).commit(); // format object if required
                //increment counters
                numOfRecordsWrittenOnCurrentSheet++;
                numOfRecordsWrittenOnCurrentFile++;
                currentRecordsWrittenOverall++


            } else {


                if (numOfRecordsWrittenOnCurrentSheet === inputs.max_num_rows_per_sheet) {
                    sheet.commit();
                    currentSheetNumber++;
                    currentSheetName = 'sheet_' + currentSheetNumber;

                    //create the new sheet
                    sheet = workbook.addWorksheet(currentSheetName);

                    //addd headers
                    sheet.addRow(inputs.sheets_headers).commit();
                    currentRecordsWrittenOverall++;
                    numOfRecordsWrittenOnCurrentFile++;

                    //reset counter for the current sheet
                    numOfRecordsWrittenOnCurrentSheet = 1;

                    //add the current record to the sheet
                    sheet.addRow(Object.values(record)).commit(); // format object if required

                    //increment counters
                    numOfRecordsWrittenOnCurrentSheet++;
                    numOfRecordsWrittenOnCurrentFile++;
                    currentRecordsWrittenOverall++;

                } else {
                    //simply add to the current sheet
                    //add the current record to the sheet
                    sheet.addRow(Object.values(record)).commit(); // format object if required
                    //increment counters
                    numOfRecordsWrittenOnCurrentSheet++;
                    numOfRecordsWrittenOnCurrentFile++;
                    currentRecordsWrittenOverall++;

                }
            }
        }



        finalStream.on('end', async function () {

            //======================
            // write the file
            //========================
            sheet.commit();
            await workbook.commit();
            generatedExcelFiles.push(currentFileName);

            //======================
            // destroy database connection
            //========================
            dbConnection.destroy();

            resolve(generatedExcelFiles);

        });

        finalStream.on('error', function (err) {
            throw err;
        });
    });

}

module.exports = GenerateExcelsFromSqlQuery;
