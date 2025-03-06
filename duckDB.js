// install duckB: npm install @duckdb/node-api
// for more see here: https://www.npmjs.com/package/@duckdb/node-api

const {  DuckDBInstance  } = require('@duckdb/node-api');

async function main() {

    // Initialize a new DuckDB database in memory
    const instance = await DuckDBInstance.create('my_duckdb.db');

// Create a connection to the database
    const connection = await instance.connect();

// Create a new table named 'people' with columns 'id' and 'name'
   // await connection.run('CREATE TABLE people (id INTEGER, name VARCHAR);');

    // Insert individual rows into the 'people' table
    await connection.run("INSERT INTO people VALUES (1, 'Alice');");
    await connection.run("INSERT INTO people VALUES (2, 'Bob');");

// Insert multiple rows at once
    await connection.run("INSERT INTO people VALUES (3, 'Charlie'), (4, 'Diana');");

    // Query all rows from the 'people' table
    const reader = await connection.runAndReadAll('SELECT * FROM people;');
    const rows = reader.getRows();

// Iterate over the result set and log each row
    for (const row of rows) {
        console.log(row);
    }

// Close the connection to the database
    await connection.close();




}

main();
