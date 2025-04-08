const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Obtener todas las multas
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT multas.*, usuarios.nombre AS usuario_nombre
            FROM multas
            JOIN usuarios ON multas.usuario_id = usuarios.id
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener una multa por ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT multas.*, usuarios.nombre AS usuario_nombre
            FROM multas
            JOIN usuarios ON multas.usuario_id = usuarios.id
            WHERE multas.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Multa no encontrada" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    const { usuario_id, monto, motivo, fecha, pagado } = req.body;

    if (!usuario_id || !monto) {
        return res.status(400).json({ error: "usuario_id y monto son obligatorios" });
    }

    try {
        const query = `
            INSERT INTO multas (usuario_id, monto, motivo, fecha, pagado)
            VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5)
            RETURNING *
        `;

        const result = await pool.query(query, [
            usuario_id,
            monto,
            motivo || null,
            fecha || null,
            pagado || false
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Actualizar una multa
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { usuario_id, monto, motivo, fecha, pagado } = req.body;

    try {
        const result = await pool.query(`
            UPDATE multas
            SET usuario_id = $1,
                monto = $2,
                motivo = $3,
                fecha = $4,
                pagado = $5
            WHERE id = $6
            RETURNING *
        `, [
            usuario_id,
            monto,
            motivo || null,
            fecha || null,
            pagado,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Multa no encontrada" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una multa
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("DELETE FROM multas WHERE id = $1 RETURNING *", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Multa no encontrada" });
        }

        res.json({ message: "Multa eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
