const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",          // Tu usuario de PostgreSQL
  host: "localhost",         // Host de la base de datos
  database: "biblioteca",// Nombre de la nueva base de datos
  password: "postgres", // Tu contraseña de PostgreSQL
  port: 5432                 // Puerto por defecto de PostgreSQL
});

pool.connect()
  .then(() => console.log("🟢 Conexión a PostgreSQL exitosa"))
  .catch(err => console.error("🔴 Error al conectar a PostgreSQL", err));

module.exports = pool;