const GetMariaDbConnection = require("../jobs/GetMariaDbConnection");

/**
 * Execute a query an return the result
 * @param query
 * @returns {Promise<unknown>}
 * @constructor
 */
async function ExecuteSqlQuery(query) {

    const connection = await GetMariaDbConnection();

    return new Promise((resolve, reject) => {

        connection.query(query, (error, results, fields) => {
            if (error) {
                return reject(error.message);
            }
            resolve(results);
            connection.end();

        });
    });

}

module.exports = ExecuteSqlQuery;
