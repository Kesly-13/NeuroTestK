const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "../certs/isrgrootx1.pem")),
  },
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar con TiDB Cloud:", err);
    return;
  }

  console.log("✅ Conectado correctamente a TiDB Cloud");
});

module.exports = connection;