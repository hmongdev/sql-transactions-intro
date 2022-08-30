const pg = require('pg');

const config = {
  database: 'bank', 
  host: 'localhost', 
  port: 5432, 
  max: 10, 
  idleTimeoutMillis: 30000 
};

// Atomicity - A transaction must be fully complete, saved (committed) or completely undone (rolled back). It's all or nothing.
// Consistency - The transaction must be fully compliant with the state of the database as it was prior to the transaction. (No breaking database constraints.)
// Isolation - Transaction data is not available outside the original transaction until it is either committed or rolled back.
// Durability - Transaction data changes must be available, even in the event of database failure.

const pool = new pg.Pool(config);

pool.on("connect", () => {
  console.log("connected to postgres");
});

pool.on("error", (err) => {
  console.log("error connecting to postgres", err);
});

module.exports = pool;