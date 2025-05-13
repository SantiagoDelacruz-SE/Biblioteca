const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const pool = require("./config/database"); // Asegúrate de que esta ruta sea correcta
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path'); // Necesitamos el módulo 'path'

dotenv.config();

const app = express();
const swaggerDocument = YAML.load('./swagger.yaml');

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });

app.use(
    session({
        secret: process.env.SESSION_SECRET || "clave-segura-por-defecto", // Usar una variable de entorno o valor por defecto
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

// --- Nuevo middleware para servir archivos estáticos ---
// Esto servirá automáticamente index.html cuando se acceda a la raíz (/)
// Asegúrate de que la carpeta 'public' exista en la raíz de tu proyecto
app.use(express.static(path.join(__dirname, 'public')));
// -------------------------------------------------------

// Ruta protegida de ejemplo (si aún la necesitas, si no, puedes quitarla)
// app.get("/private", keycloak.protect(), (req, res) => {
//     res.send("Acceso autorizado a una ruta privada 🚀");
// });

// La ruta de prueba para "/" ya no es necesaria si express.static sirve index.html
// app.get("/", (req, res) => {
//     res.send("API de Biblioteca en funcionamiento 🚀");
// });

// Importar TODAS las rutas
const authRoutes = require("./routes/auth.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const librosRoutes = require("./routes/libros.routes");
const autoresRoutes = require("./routes/autores.routes");
const categoriasRoutes = require("./routes/categorias.routes");
const prestamosRoutes = require("./routes/prestamos.routes");
const multasRoutes = require("./routes/multas.routes");

// Usar rutas con prefijos lógicos
// Nota: Algunas de estas rutas están protegidas con Keycloak.
// Asegúrate de que la configuración de Keycloak y las rutas protegidas sean correctas para tu caso de uso.
app.use("/auth", keycloak.protect(), authRoutes);
app.use("/api/usuarios", keycloak.protect(), usuariosRoutes);
app.use("/api/libros", librosRoutes);
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
