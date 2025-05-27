const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const pool = require("./config/database");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

dotenv.config();

const app = express();
const swaggerDocument = YAML.load('./swagger.yaml');

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });

app.use(
    session({
        secret: process.env.SESSION_SECRET || "clave-segura-por-defecto",
        resave: false,
        saveUninitialized: true,
        store: memoryStore,
    })
);
app.use(keycloak.middleware());

app.use(express.json());
app.use((req, res, next) => {
    console.log('📦 Body recibido:', req.body);
    console.log('🔍 Headers:', req.headers['content-type']);
    next();
});

app.use(cors());
app.use(helmet());

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la página de inicio
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta para la página de libros
app.get("/api/libros", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "libros.html"));
});

// Importar TODAS las rutas
const authRoutes = require("./routes/auth.routes");
const librosRoutes = require("./routes/libros.routes.js")
const usuariosRoutes = require("./routes/usuarios.routes");
const autoresRoutes = require("./routes/autores.routes");
const categoriasRoutes = require("./routes/categorias.routes");
const prestamosRoutes = require("./routes/prestamos.routes");
const multasRoutes = require("./routes/multas.routes");

// Usar rutas con prefijos lógicos
app.use("/auth", keycloak.protect(), authRoutes);
app.use("/api/usuarios", keycloak.protect(), usuariosRoutes);
app.use("api/libros", librosRoutes);
app.use("/api/autores", autoresRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/prestamos", prestamosRoutes);
app.use("/api/multas", multasRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).send("Ruta no encontrada.");
});

// Middleware para manejar errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
    console.log(`Documentación Swagger en http://localhost:${PORT}/api-docs`);
});