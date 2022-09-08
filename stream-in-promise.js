// require modules
const fs = require('fs');
const archiver = require('archiver');
var path = require('path');

// NOTE: the resolve is INSIDE the callback on the on.('close')
// because it means that the stream has finished and so we can resolve the promise

function CreateZipFile(pathWhereSaveZip, filesToPutOnZip) {


    return new Promise((resolve, reject) => {

        //=========================
        // create a file to stream archive data to.
        //===========================
        const output = fs.createWriteStream(pathWhereSaveZip);

        //=========================
        // create the archive stream
        //===========================
        const archive = archiver('zip', {
            zlib: {level: 9} // Sets the compression level.
        });

        //=========================
        // set listeners to the streams
        //===========================
        setListenersOnStreams(output, archive);

        // listen for all archive data to be written
        // 'close' event is fired only when a file descriptor is involved
        // archiver has been finalized and the output file descriptor has closed.

        output.on('close', function() {
            resolve();
        });


        //===========================
        // pipe archive data to the file
        //=============================
        archive.pipe(output);

        //===========================
        // append files from stream
        //===========================
        filesToPutOnZip.forEach((file) => {
            archive.append(fs.createReadStream(file), {name: path.basename(file)});

        })



        //===========================
        // finalize
        //===========================
        // finalize the archive (ie we are done appending files but streams have to finish yet)
        // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
        archive.finalize();



    });


}

function setListenersOnStreams(output, archive) {

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
        throw err;
    });


}

module.exports = CreateZipFile;
