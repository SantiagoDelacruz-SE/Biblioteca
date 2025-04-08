// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const helmet = require("helmet");
// const sequelize = require("./config/database");
// const authRoutes = require("./routes/auth.routes");

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(helmet());

// app.get("/", (req, res) => {
//     res.send("API de Biblioteca en funcionamiento 🚀");
// });

// // Rutas de autenticación
// app.use("/auth", authRoutes);

// // Sincronizar modelos con la base de datos
// sequelize.sync()
//     .then(() => console.log("🟢 Base de datos sincronizada"))
//     .catch(err => console.error("🔴 Error al sincronizar la base de datos:", err));


// // Importar rutas
// const usuariosRoutes = require("./routes/usuarios.routes");
// const librosRoutes = require("./routes/libros.routes");

// // Usar rutas
// app.use("/api/usuarios", usuariosRoutes);
// app.use("/api/libros", librosRoutes);

// // Configuración de Swagger
// const swaggerOptions = {
//     definition: {
//         openapi: "3.0.0",
//         info: {
//             title: "API Biblioteca",
//             version: "1.0.0",
//             description: "API REST para la gestión de una biblioteca"
//         }
//     },
//     apis: ["./src/routes/*.js"]
// };

// // const specs = swaggerJsdoc(swaggerOptions);
// // app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./config/database");

dotenv.config();

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    console.log('📦 Body recibido:', req.body); // Muestra el body en consola
    console.log('🔍 Headers:', req.headers['content-type']); // Verifica el Content-Type
    next(); // Pasa al siguiente middleware
});

app.use(cors());
app.use(helmet());

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
const ejemplaresRoutes = require("./routes/ejemplares.routes");
const prestamosRoutes = require("./routes/prestamos.routes");
const multasRoutes = require("./routes/multas.routes");
const notificacionesRoutes = require("./routes/notificaciones.routes");
const resenasRoutes = require("./routes/reseñas.routes");
const historialRoutes = require("./routes/historial.routes");

// Usar rutas con prefijos lógicos
app.use("/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/libros", librosRoutes);
app.use("/api/autores", autoresRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/ejemplares", ejemplaresRoutes);
app.use("/api/prestamos", prestamosRoutes);
app.use("/api/multas", multasRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/resenas", resenasRoutes);
app.use("/api/historial", historialRoutes);

// // Sincronizar BD (solo para desarrollo)
// sequelize.sync({ force: true }) // ¡Esto borrará todos los datos!
//   .then(() => console.log("🟢 Base de datos recreada desde cero"))
//   .catch(err => console.error("🔴 Error:", err));

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
});