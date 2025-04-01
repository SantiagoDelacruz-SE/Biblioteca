const express = require("express");
const pool = require("../db");

const router = express.Router();

// Obtener todos los libros
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM libros");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear un libro
router.post("/", async (req, res) => {
    try {
        const { titulo, autor_id, categoria_id, isbn, año_publicacion } = req.body;
        const result = await pool.query(
            "INSERT INTO libros (titulo, autor_id, categoria_id, isbn, año_publicacion) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [titulo, autor_id, categoria_id, isbn, año_publicacion]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
