const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // Conexión a la base de datos

// Obtener todos los ejemplares
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ejemplares');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un ejemplar por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM ejemplares WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ejemplar no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo ejemplar
router.post('/', async (req, res) => {
    const { libro_id, ubicacion, estado } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO ejemplares (libro_id, ubicacion, estado) VALUES ($1, $2, $3) RETURNING *',
            [libro_id, ubicacion, estado]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un ejemplar
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { ubicacion, estado } = req.body;
    try {
        const result = await pool.query(
            'UPDATE ejemplares SET ubicacion = $1, estado = $2 WHERE id = $3 RETURNING *',
            [ubicacion, estado, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ejemplar no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un ejemplar
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM ejemplares WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Ejemplar no encontrado' });
        }
        res.json({ message: 'Ejemplar eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
