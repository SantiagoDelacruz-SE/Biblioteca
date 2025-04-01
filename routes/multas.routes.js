const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // Conexión a la base de datos

// Obtener todas las multas
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM multas');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener una multa por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM multas WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Multa no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva multa
router.post('/', async (req, res) => {
    const { usuario_id, monto, fecha_generada, estado } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO multas (usuario_id, monto, fecha_generada, estado) VALUES ($1, $2, $3, $4) RETURNING *',
            [usuario_id, monto, fecha_generada, estado]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una multa
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const result = await pool.query(
            'UPDATE multas SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Multa no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una multa
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM multas WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Multa no encontrada' });
        }
        res.json({ message: 'Multa eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
