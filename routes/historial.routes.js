const express = require('express');
const router = express.Router();
const pool = require('../db'); // Conexión a la base de datos

// Obtener todo el historial de préstamos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM historial_prestamos');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un registro del historial por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM historial_prestamos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar un nuevo registro al historial de préstamos
router.post('/', async (req, res) => {
    const { usuario_id, ejemplar_id, fecha_prestamo, fecha_devolucion, estado } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO historial_prestamos (usuario_id, ejemplar_id, fecha_prestamo, fecha_devolucion, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [usuario_id, ejemplar_id, fecha_prestamo, fecha_devolucion, estado]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un registro del historial de préstamos
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { fecha_devolucion, estado } = req.body;
    try {
        const result = await pool.query(
            'UPDATE historial_prestamos SET fecha_devolucion = $1, estado = $2 WHERE id = $3 RETURNING *',
            [fecha_devolucion, estado, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un registro del historial de préstamos
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM historial_prestamos WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }
        res.json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
