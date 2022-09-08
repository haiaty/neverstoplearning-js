"use strict";
const exceljs = require('exceljs')
var fs = require('fs');
const LoadConfigs = require("../../LoadConfigs")
const GetMariaDbConnection = require("../jobs/GetMariaDbConnection");

async function GenerateExcelsFromSqlQuery(inputs) {

    const configs = LoadConfigs();

    const dbConnection = await GetMariaDbConnection(configs);

    return new Promise((resolve, reject) => {
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


        var finalStream = dbConnection.query(query).stream({highWaterMark: 1000});

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
        var currentFileName = tempFolderToHoldExcels + "/report_" + currentFileNumber + ".xls";
        //var writeStream = fs.createWriteStream("./export_" + currentFileNumber + ".xls");
        var options = {
            //stream: writeStream,
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



        finalStream.on('data', function (d) {

            //===========================
            // Verify if a new file should be created
            //==========================
            if(numOfRecordsWrittenOnCurrentFile === inputs.max_num_rows_per_file) {

                sheet.commit();
                workbook.commit();
                generatedExcelFiles.push(currentFileName);
                currentFileNumber++;
                currentFileName = tempFolderToHoldExcels + "/report_" + currentFileNumber + ".xls";

                options = {
                    //stream: res,  -- for http response - see https://github.com/sd50712321/large-excel-stream-with-mysql-example/blob/main/routes/index.js
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
                sheet.addRow(Object.values(d)).commit(); // format object if required
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
                    sheet.addRow(Object.values(d)).commit(); // format object if required

                    //increment counters
                    numOfRecordsWrittenOnCurrentSheet++;
                    numOfRecordsWrittenOnCurrentFile++;
                    currentRecordsWrittenOverall++;

                } else {
                    //simply add to the current sheet
                    //add the current record to the sheet
                    sheet.addRow(Object.values(d)).commit(); // format object if required
                    //increment counters
                    numOfRecordsWrittenOnCurrentSheet++;
                    numOfRecordsWrittenOnCurrentFile++;
                    currentRecordsWrittenOverall++;

                }
            }



        });

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
