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
const prestamosRoutes = require("./routes/prestamos.routes");
const multasRoutes = require("./routes/multas.routes");

// Usar rutas con prefijos lógicos
app.use("/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/libros", librosRoutes);
app.use("/api/autores", autoresRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/prestamos", prestamosRoutes);
app.use("/api/multas", multasRoutes);



// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
});