const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false, // Desactiva logs de SQL en consola
});

sequelize.authenticate()
    .then(() => console.log("🟢 Conexión a PostgreSQL exitosa"))
    .catch(err => console.error("🔴 Error al conectar a la base de datos:", err));

module.exports = sequelize;
