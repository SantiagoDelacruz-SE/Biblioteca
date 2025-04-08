// Crear un nuevo autor
router.post('/', async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El campo nombre es obligatorio' });
        }

        const result = await pool.query(
            'INSERT INTO autores (nombre) VALUES ($1) RETURNING *',
            [nombre]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error en POST /autores:", error);
        res.status(500).json({ error: "Error al crear autor" });
    }
});
