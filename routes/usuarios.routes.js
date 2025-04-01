const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// Obtener todos los usuarios
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM usuarios");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener un usuario por ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear un usuario
router.post("/", async (req, res) => {
    try {
        const { nombre, correo, contraseña_hash, rol_id, estado } = req.body;
        const result = await pool.query(
            "INSERT INTO usuarios (nombre, correo, contraseña_hash, rol_id, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [nombre, correo, contraseña_hash, rol_id, estado]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar usuario
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, contraseña_hash, rol_id, estado } = req.body;
        const result = await pool.query(
            "UPDATE usuarios SET nombre=$1, correo=$2, contraseña_hash=$3, rol_id=$4, estado=$5 WHERE id=$6 RETURNING *",
            [nombre, correo, contraseña_hash, rol_id, estado, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar usuario
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
