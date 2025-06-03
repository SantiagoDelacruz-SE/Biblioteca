// santiagodelacruz-se/biblioteca/Biblioteca-Ft_1/routes/libros.routes.js
const express = require("express");
const pool = require("../config/database");

const router = express.Router();

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
    
    try {
        const { titulo, autor_id, categoria_id, isbn, anio_publicacion } = req.body;

        if (!titulo) {
            return res.status(400).json({ error: "El campo 'titulo' es obligatorio" });
        }
        if (!autor_id && titulo) {
             console.warn("Advertencia: Se está creando un libro sin autor_id. Titulo:", titulo);
        }


        const result = await pool.query(
            `INSERT INTO libros (titulo, autor_id, categoria_id, isbn, anio_publicacion)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [titulo, autor_id || null, categoria_id || null, isbn || null, anio_publicacion || null]
        );

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


router.delete("/:id", async (req, res) => {
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


module.exports = router;