// lib/db.ts
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",       // ganti sesuai host MySQL
  user: "root",            // ganti sesuai user MySQL
  password: "",            // ganti sesuai password MySQL
  database: "nextjs_auth", // ganti sesuai nama database
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
