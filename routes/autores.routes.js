const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // Conexión a la base de datos

// Obtener todos los autores
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM autores');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un autor por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM autores WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Autor no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo autor
router.post('/', async (req, res) => {
    try {
        const { nombre, biografia } = req.body;
        const autor = await Autores.create({ nombre, biografia }); // Usa Sequelize
        res.status(201).json(autor);
    } catch (error) {
        console.error("Error en POST /autores:", error);
        res.status(500).json({ error: "Error al crear autor" });
    }
});

// Actualizar un autor
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, biografia } = req.body;
    try {
        const result = await pool.query(
            'UPDATE autores SET nombre = $1, biografia = $2 WHERE id = $3 RETURNING *',
            [nombre, biografia, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Autor no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un autor
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM autores WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Autor no encontrado' });
        }
        res.json({ message: 'Autor eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
