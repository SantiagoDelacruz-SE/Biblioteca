const express = require('express');
const router = express.Router();
const pool = require('../db'); // Conexión a la base de datos

// Obtener todas las sanciones
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sanciones');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener una sanción por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM sanciones WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Sanción no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva sanción
router.post('/', async (req, res) => {
    const { usuario_id, motivo, fecha_inicio, fecha_fin, estado } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO sanciones (usuario_id, motivo, fecha_inicio, fecha_fin, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [usuario_id, motivo, fecha_inicio, fecha_fin, estado]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una sanción
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { motivo, fecha_inicio, fecha_fin, estado } = req.body;
    try {
        const result = await pool.query(
            'UPDATE sanciones SET motivo = $1, fecha_inicio = $2, fecha_fin = $3, estado = $4 WHERE id = $5 RETURNING *',
            [motivo, fecha_inicio, fecha_fin, estado, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Sanción no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una sanción
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM sanciones WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Sanción no encontrada' });
        }
        res.json({ message: 'Sanción eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
