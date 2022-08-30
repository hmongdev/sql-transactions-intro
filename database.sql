CREATE TABLE account (
	id SERIAL PRIMARY KEY,
	name VARCHAR(80) NOT NULL
);

CREATE TABLE register (
	id SERIAL PRIMARY KEY,
  acct_id INTEGER REFERENCES account ON DELETE CASCADE NOT NULL,	amount MONEY NOT NULL
);

--1) Create account
insert into account (name) ('Diego''s Lavish Account') returning id;

--2) Add deposit/balance to account
insert into register (acct_id, amount)
values (5, 1000), (5, -500), (6, 100);

insert into register (acct_id, amount)
values (5, 500);

--select statement
select account.name, sum(register.amount) 
from account
join register on account.id = register.acct_id
group by account.name;

--transaction time! begin-commit; neither insert should happen since one of them fails
begin;
insert into register (acct_id, amount)
values (5, -500);
insert into register (acct_id, amount)
values (6, 500);
commit;