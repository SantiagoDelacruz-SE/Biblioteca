// santiagodelacruz-se/biblioteca/Biblioteca-Ft_1/routes/libros.routes.js
const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// Obtener todos los libros
// Esta ruta está protegida por keycloak.protect() en server.js,
// por lo que cualquier usuario autenticado puede ver los libros.
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                libros.*, 
                autores.nombre AS autor_nombre, 
                categorias.nombre AS categoria_nombre
            FROM libros
            LEFT JOIN autores ON libros.autor_id = autores.id
            LEFT JOIN categorias ON libros.categoria_id = categorias.id
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Error en GET /api/libros:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Crear un libro (SOLO USUARIOS CON ROL 'admin')
router.post("/", async (req, res) => {
    // Verificación de rol de administrador
    // req.kauth.grant contiene la información del token decodificado por keycloak-connect
    if (!req.kauth || !req.kauth.grant || !req.kauth.grant.access_token.hasRealmRole('admin')) {
        // Si tu rol 'admin' es un rol de cliente para 'biblioteca-backend', usa:
        // !req.kauth.grant.access_token.hasClientRole('biblioteca-backend', 'admin')
        return res.status(403).json({ error: "Acceso denegado: Se requiere rol de administrador." });
    }

    try {
        const { titulo, autor_id, categoria_id, isbn, anio_publicacion } = req.body;

        if (!titulo) {
            return res.status(400).json({ error: "El campo 'titulo' es obligatorio" });
        }
        // IMPORTANTE: El frontend envía 'autor_nombre'. El backend espera 'autor_id'.
        // Esta es una discrepancia que se debe resolver para que la creación funcione.
        // Por ahora, asumimos que el frontend enviará un 'autor_id' válido.
        // Si no se envía autor_id, y la columna en la BD no lo permite nulo, fallará.
        if (!autor_id && titulo) { // Ejemplo de validación si autor_id fuera obligatorio
             console.warn("Advertencia: Se está creando un libro sin autor_id. Titulo:", titulo);
        }


        const result = await pool.query(
            `INSERT INTO libros (titulo, autor_id, categoria_id, isbn, anio_publicacion)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [titulo, autor_id || null, categoria_id || null, isbn || null, anio_publicacion || null]
        );

        // Para devolver el libro con nombre de autor y categoría como en el GET
        const newBookId = result.rows[0].id;
        const newBookDetails = await pool.query(`
            SELECT 
                l.*, 
                a.nombre AS autor_nombre, 
                c.nombre AS categoria_nombre
            FROM libros l
            LEFT JOIN autores a ON l.autor_id = a.id
            LEFT JOIN categorias c ON l.categoria_id = c.id
            WHERE l.id = $1
        `, [newBookId]);

        res.status(201).json(newBookDetails.rows[0]);
    } catch (err) {
        console.error("Error en POST /api/libros:", err.message, "Datos recibidos:", req.body);
        res.status(500).json({ error: "Error interno al crear el libro: " + err.message });
    }
});

// Eliminar un libro (SOLO USUARIOS CON ROL 'admin')
router.delete("/:id", async (req, res) => {
    // Verificación de rol de administrador
    if (!req.kauth || !req.kauth.grant || !req.kauth.grant.access_token.hasRealmRole('admin')) {
        return res.status(403).json({ error: "Acceso denegado: Se requiere rol de administrador." });
    }

    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM libros WHERE id = $1 RETURNING *", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Libro no encontrado" });
        }

        res.json({ message: "Libro eliminado correctamente", libroEliminado: result.rows[0] });
    } catch (err) {
        console.error(`Error en DELETE /api/libros/${id}:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

// Aquí irían las rutas PUT para actualizar, también protegidas por rol de admin.

module.exports = router;