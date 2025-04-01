const express = require('express');
const router = express.Router();
const pool = require('../db'); // Asegúrate de tener la conexión a la BD en db.js

// Obtener todos los préstamos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM prestamos');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo préstamo
router.post('/', async (req, res) => {
    const { usuario_id, ejemplar_id, fecha_prestamo, fecha_devolucion, estado } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO prestamos (usuario_id, ejemplar_id, fecha_prestamo, fecha_devolucion, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [usuario_id, ejemplar_id, fecha_prestamo, fecha_devolucion, estado]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un préstamo
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { fecha_devolucion, estado } = req.body;
    try {
        const result = await pool.query(
            'UPDATE prestamos SET fecha_devolucion = $1, estado = $2 WHERE id = $3 RETURNING *',
            [fecha_devolucion, estado, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un préstamo
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM prestamos WHERE id = $1', [id]);
        res.json({ message: 'Préstamo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
