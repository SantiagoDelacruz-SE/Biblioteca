const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// Obtener todos los autores
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM autores");
        res.json(result.rows);
    } catch (err) {
        console.error("Error en GET /api/autores:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Crear un autor
router.post("/", async (req, res) => {

    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ error: "El campo 'nombre' es obligatorio" });
        }
        const result = await pool.query(
            "INSERT INTO autores (nombre) VALUES ($1) RETURNING *",
            [nombre]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error en POST /api/autores:", err.message, "Datos recibidos:", req.body);
        res.status(500).json({ error: "Error interno al crear el autor: " + err.message });
    }
});

// Eliminar un autor
router.delete("/:id", async (req, res) => {

    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM autores WHERE id = $1 RETURNING *", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Autor no encontrado" });
        }
        res.json({ message: "Autor eliminado correctamente", autorEliminado: result.rows[0] });
    } catch (err) {
        console.error(`Error en DELETE /api/autores/${id}:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;