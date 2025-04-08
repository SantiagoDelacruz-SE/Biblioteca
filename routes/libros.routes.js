const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// Obtener todos los libros
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
        res.status(500).json({ error: err.message });
    }
});

// Crear un libro
router.post("/", async (req, res) => {
    try {
        const { titulo, autor_id, categoria_id, isbn, anio_publicacion } = req.body;

        // Validar campo obligatorio
        if (!titulo) {
            return res.status(400).json({ error: "El campo 'titulo' es obligatorio" });
        }

        const result = await pool.query(
            `INSERT INTO libros (titulo, autor_id, categoria_id, isbn, anio_publicacion)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [titulo, autor_id || null, categoria_id || null, isbn || null, anio_publicacion || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar un libro
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM libros WHERE id = $1 RETURNING *", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Libro no encontrado" });
        }

        res.json({ message: "Libro eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
