import mysql from 'mysql2';

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'aithera'
}).promise();

export default pool;