const express = require('express');
const router = express.Router();

const pool = require('../modules/pool');

//GET
router.get('/', (req, res) => {
    // res.send('Hello?');
    const sqlQuery = `
  select account.name, sum(register.amount)
  from account
  join register on account.id = register.acct_id
  group by account.name
  order by account.name;
  `;
    pool.query(sqlQuery)
        .then((result) => {
            console.log(`Money numbers`, result.rows);
            res.send(result.rows);
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(500);
        });
});

//POST
router.post('/transfer', async (req, res) => {
    const toId = req.body.toId;
    const fromId = req.body.fromId;
    const amount = req.body.amount;
    console.log(
        `Transferring ${amount} from acct with id ${fromId} to account with ${toId} id`
    );

    //* declare connection
    const connection = await pool.connect();
    //* try - catch block
    try {
        await connection.query('BEGIN');
        const sqlText = `
    insert into register (acct_id, amount)
    values ($1, $2)`;
        await connection.query(sqlText, [fromId, -amount]);
        await connection.query(sqlText, [toId, amount]);
        await connection.query('COMMIT');
        res.sendStatus(200);
    } catch (error) {
        await connection.query('ROLLBACK');
        console.log(`Error moving in POST`, error);
        res.sendStatus(500);
    } finally {
        connection.release();
    }
});

//POST for /new
router.post('/new', async (req, res) => {
    const name = req.body.name;
    const amount = req.body.amount;
    console.log(
        `Creating new account called ${name} with initial balance of ${amount}`
    );

    const connection = await pool.connect();

    //* try
    try {
        await connection.query('BEGIN');
        const sqlAddAccount = `
        insert into account (name)
        values ($1) returning id;
        `;
        const result = await connection.query(sqlAddAccount, [name]); //gets ID
        //new id of account
        const accountId = result.rows[0].id;
        //initial deposit text
        const sqlInitialDeposit = `
        insert into register (acct_id, amount)
        values ($1, $2)
        `;
        await connection.query(sqlInitialDeposit, [accountId, amount]);
        await connection.query('COMMIT');
        res.sendStatus(200);
    } catch (error) {
        await connection.query('ROLLBACK');
        console.log(`Error moving in /new`, error);
        res.sendStatus(500);
    } finally {
        connection.release();
    }
});

module.exports = router;
