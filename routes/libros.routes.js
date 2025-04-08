const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Obtener todos los libros
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT libros.*, 
                   autores.nombre AS autor_nombre, 
                   categorias.nombre AS categoria_nombre
            FROM libros
            LEFT JOIN autores ON libros.autor_id = autores.id
            LEFT JOIN categorias ON libros.categoria_id = categorias.id
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un libro por ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT libros.*, 
                   autores.nombre AS autor_nombre, 
                   categorias.nombre AS categoria_nombre
            FROM libros
            LEFT JOIN autores ON libros.autor_id = autores.id
            LEFT JOIN categorias ON libros.categoria_id = categorias.id
            WHERE libros.id = $1
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Libro no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo libro
router.post("/", async (req, res) => {
    const { titulo, autor_id, categoria_id, isbn, anio_publicacion } = req.body;
    if (!titulo) {
        return res.status(400).json({ error: "El título es obligatorio" });
    }

    try {
        const result = await pool.query(`
            INSERT INTO libros (titulo, autor_id, categoria_id, isbn, anio_publicacion)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [titulo, autor_id || null, categoria_id || null, isbn || null, anio_publicacion || null]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un libro
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { titulo, autor_id, categoria_id, isbn, anio_publicacion } = req.body;

    try {
        const result = await pool.query(`
            UPDATE libros
            SET titulo = $1, autor_id = $2, categoria_id = $3, isbn = $4, anio_publicacion = $5
            WHERE id = $6
            RETURNING *
        `, [titulo, autor_id || null, categoria_id || null, isbn || null, anio_publicacion || null, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Libro no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
