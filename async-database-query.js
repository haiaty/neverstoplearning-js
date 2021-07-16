
// you should have installed node > 10
// you should install mysql :    npm install mysql

// RUN:  node index.js

// index.js

var query = require("./query.js");


(async function () {

    try {

        var result = await query();
        console.log("result is: ", result);

    } catch(e) {

    }

})();


// query.js ---- put the below code in another file at same level of index.js

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'rootdb',
  database : 'my_database'
});

connection.connect();



async function query() {

    var query = `
    SELECT COUNT(*)
            FROM my_table
            WHERE param='hello'
    `

    return new Promise(function(resolve, reject) {
        connection.query(query, function (error, results, fields) {
        if (error) throw error;
        resolve(results);
        connection.end();
      })
    
    
    });
}


module.exports = query;
