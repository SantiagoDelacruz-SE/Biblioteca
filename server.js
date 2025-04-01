const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const sequelize = require("./config/database");
const authRoutes = require("./routes/auth.routes");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.get("/", (req, res) => {
    res.send("API de Biblioteca en funcionamiento 🚀");
});

// Rutas de autenticación
app.use("/auth", authRoutes);

// Sincronizar modelos con la base de datos
sequelize.sync()
    .then(() => console.log("🟢 Base de datos sincronizada"))
    .catch(err => console.error("🔴 Error al sincronizar la base de datos:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🟢 Servidor corriendo en puerto ${PORT}`));
