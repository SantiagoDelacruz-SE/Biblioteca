const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // Conexión a la base de datos

// Obtener todas las reseñas
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM resenas');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener una reseña por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM resenas WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reseña no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva reseña
router.post('/', async (req, res) => {
    const { usuario_id, libro_id, comentario, calificacion, fecha } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO resenas (usuario_id, libro_id, comentario, calificacion, fecha) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [usuario_id, libro_id, comentario, calificacion, fecha]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una reseña
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { comentario, calificacion } = req.body;
    try {
        const result = await pool.query(
            'UPDATE resenas SET comentario = $1, calificacion = $2 WHERE id = $3 RETURNING *',
            [comentario, calificacion, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reseña no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una reseña
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM resenas WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Reseña no encontrada' });
        }
        res.json({ message: 'Reseña eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
