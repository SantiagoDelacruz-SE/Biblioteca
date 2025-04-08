const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Obtener todos los préstamos
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT prestamos.*, 
                   usuarios.nombre AS usuario_nombre, 
                   libros.titulo AS libro_titulo
            FROM prestamos
            JOIN usuarios ON prestamos.usuario_id = usuarios.id
            JOIN libros ON prestamos.libro_id = libros.id
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un préstamo por ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT prestamos.*, 
                   usuarios.nombre AS usuario_nombre, 
                   libros.titulo AS libro_titulo
            FROM prestamos
            JOIN usuarios ON prestamos.usuario_id = usuarios.id
            JOIN libros ON prestamos.libro_id = libros.id
            WHERE prestamos.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Préstamo no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo préstamo
router.post("/", async (req, res) => {
    const { usuario_id, libro_id, fecha_prestamo, fecha_devolucion, devuelto } = req.body;

    if (!usuario_id || !libro_id) {
        return res.status(400).json({ error: "usuario_id y libro_id son obligatorios" });
    }

    try {
        let query, params;

        // Si se incluye fecha_prestamo, úsala
        if (fecha_prestamo) {
            query = `
                INSERT INTO prestamos (usuario_id, libro_id, fecha_prestamo, fecha_devolucion, devuelto)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`;
            params = [
                usuario_id,
                libro_id,
                fecha_prestamo,
                fecha_devolucion || null,
                devuelto || false
            ];
        } else {
            // Si no, deja que la base de datos use CURRENT_DATE por defecto
            query = `
                INSERT INTO prestamos (usuario_id, libro_id, fecha_devolucion, devuelto)
                VALUES ($1, $2, $3, $4)
                RETURNING *`;
            params = [
                usuario_id,
                libro_id,
                fecha_devolucion || null,
                devuelto || false
            ];
        }

        const result = await pool.query(query, params);
        res.status(201).json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Actualizar un préstamo
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { usuario_id, libro_id, fecha_prestamo, fecha_devolucion, devuelto } = req.body;

    try {
        const result = await pool.query(`
            UPDATE prestamos
            SET usuario_id = $1,
                libro_id = $2,
                fecha_prestamo = $3,
                fecha_devolucion = $4,
                devuelto = $5
            WHERE id = $6
            RETURNING *
        `, [usuario_id, libro_id, fecha_prestamo, fecha_devolucion, devuelto, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Préstamo no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un préstamo
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("DELETE FROM prestamos WHERE id = $1 RETURNING *", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Préstamo no encontrado" });
        }

        res.json({ message: "Préstamo eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
