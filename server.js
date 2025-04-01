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


// Importar rutas
const usuariosRoutes = require("./routes/usuarios.routes");
const librosRoutes = require("./routes/libros.routes");

// Usar rutas
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/libros", librosRoutes);

// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Biblioteca",
            version: "1.0.0",
            description: "API REST para la gestión de una biblioteca"
        }
    },
    apis: ["./src/routes/*.js"]
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});