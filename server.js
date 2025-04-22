const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const pool = require("./config/database");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

dotenv.config();

const app = express();
const swaggerDocument = YAML.load('./swagger.yaml');

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });

app.use(
  session({
    secret: "your-secret", // Cambia esto por un secreto seguro
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);
app.use(keycloak.middleware());

app.use(express.json());
app.use((req, res, next) => {
    console.log('📦 Body recibido:', req.body); // Muestra el body en consola
    console.log('🔍 Headers:', req.headers['content-type']); // Verifica el Content-Type
    next(); // Pasa al siguiente middleware
});

app.use(cors());
app.use(helmet());

// Ruta protegida de ejemplo
app.get("/private", keycloak.protect(), (req, res) => {
    res.send("Acceso autorizado a una ruta privada 🚀");
});

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("API de Biblioteca en funcionamiento 🚀");
});

// Importar TODAS las rutas
const authRoutes = require("./routes/auth.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const librosRoutes = require("./routes/libros.routes");
const autoresRoutes = require("./routes/autores.routes");
const categoriasRoutes = require("./routes/categorias.routes");
const prestamosRoutes = require("./routes/prestamos.routes");
const multasRoutes = require("./routes/multas.routes");

// Usar rutas con prefijos lógicos
app.use("/auth", keycloak.protect(), authRoutes); // Protegemos rutas de autenticación
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/libros", librosRoutes);
app.use("/api/autores", autoresRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/prestamos", prestamosRoutes);
app.use("/api/multas", multasRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
});