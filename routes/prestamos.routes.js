const { Router } = require('express');
const { getPool } = require('../config/database'); // Ajusta la ruta si es necesario
// No necesitas importar Keycloak aquí si la protección se aplica en server.js

const router = Router();

// !!! IMPORTANTE: Verifica y ajusta estos IDs según tu base de datos !!!
const ID_ESTADO_EJEMPLAR_DISPONIBLE = 1; // ID para 'Disponible' en la tabla estados_ejemplar
const ID_ESTADO_EJEMPLAR_PRESTADO = 2; // ID para 'Prestado' en la tabla estados_ejemplar
const ID_ESTADO_PRESTAMO_ACTIVO = 1;   // ID para 'Activo' (o similar) en la tabla estados_prestamo

// RUTA PARA QUE UN USUARIO SOLICITE UN PRÉSTAMO
// Protegida por keycloak.protect() en server.js
router.post('/', async (req, res) => {
    const { libro_id } = req.body;
    let usuario_id;

    // Extraer usuario_id del token de Keycloak (disponible gracias a keycloak.protect())
    if (!req.kauth || !req.kauth.grant || !req.kauth.grant.access_token || !req.kauth.grant.access_token.content) {
        return res.status(401).json({ message: 'Token de autenticación no encontrado o inválido.' });
    }
    usuario_id = req.kauth.grant.access_token.content.sub; // ID de usuario (subject) de Keycloak

    if (!libro_id) {
        return res.status(400).json({ message: 'El ID del libro (libro_id) es requerido.' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Buscar un ejemplar disponible para el libro_id especificado
        const [ejemplaresDisponibles] = await connection.query(
            'SELECT id FROM ejemplares WHERE libro_id = ? AND estado_ejemplar_id = ? LIMIT 1 FOR UPDATE', // FOR UPDATE para bloquear la fila
            [libro_id, ID_ESTADO_EJEMPLAR_DISPONIBLE]
        );

        if (ejemplaresDisponibles.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'No hay ejemplares disponibles para este libro en este momento.' });
        }
        const ejemplar_id_prestado = ejemplaresDisponibles[0].id;

        // 2. Actualizar el estado del ejemplar a 'Prestado'
        const [updateResult] = await connection.query(
            'UPDATE ejemplares SET estado_ejemplar_id = ? WHERE id = ? AND estado_ejemplar_id = ?', // Doble check de estado disponible
            [ID_ESTADO_EJEMPLAR_PRESTADO, ejemplar_id_prestado, ID_ESTADO_EJEMPLAR_DISPONIBLE]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'El ejemplar ya no estaba disponible. Intenta de nuevo.' });
        }

        // 3. Crear el registro del préstamo
        const fecha_prestamo = new Date();
        const fecha_devolucion_estimada = new Date();
        fecha_devolucion_estimada.setDate(fecha_prestamo.getDate() + 15); // Préstamo por 15 días (ajusta según tus reglas)

        // La tabla 'prestamos' en init.sql usa 'libro_id'.
        // Aunque idealmente se usaría 'ejemplar_id', nos ceñimos al esquema actual.
        // Podrías considerar añadir ejemplar_id_prestado a la tabla prestamos si quieres un rastreo más específico.
        const [resultPrestamo] = await connection.query(
            'INSERT INTO prestamos (libro_id, usuario_id, fecha_prestamo, fecha_devolucion_estimada, estado_prestamo_id, ejemplar_id) VALUES (?, ?, ?, ?, ?, ?)',
            [libro_id, usuario_id, fecha_prestamo, fecha_devolucion_estimada, ID_ESTADO_PRESTAMO_ACTIVO, ejemplar_id_prestado] // Añadido ejemplar_id
        );

        await connection.commit();
        res.status(201).json({
            message: 'Préstamo realizado con éxito.',
            prestamoId: resultPrestamo.insertId,
            ejemplarIdPrestado: ejemplar_id_prestado,
            libroId: libro_id
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error al solicitar préstamo:', error);
        res.status(500).json({ message: 'Error interno del servidor al procesar el préstamo.' });
    } finally {
        if (connection) connection.release();
    }
});

// RUTA PARA QUE UN ADMIN VEA LOS LIBROS PRESTADOS (SIN INFO DEL USUARIO)
// Protegida por keycloak.protect() en server.js. Para restringir a rol admin, se haría en Keycloak o con una verificación de rol aquí.
router.get('/admin-view', async (req, res) => {
    // Verificación de rol de admin (ejemplo básico, Keycloak ofrece formas más robustas)
    if (!req.kauth.grant.access_token.content.realm_access || !req.kauth.grant.access_token.content.realm_access.roles.includes('admin')) { // Ajusta 'admin' al nombre de tu rol de admin en Keycloak
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }

    try {
        const pool = await getPool();
        const [prestamos] = await pool.query(`
            SELECT 
                p.id AS prestamo_id,
                l.titulo AS libro_titulo,
                e.codigo_ejemplar AS codigo_del_ejemplar,
                p.fecha_prestamo,
                p.fecha_devolucion_estimada,
                ep.nombre_estado AS estado_del_prestamo
            FROM prestamos p
            JOIN libros l ON p.libro_id = l.id
            JOIN ejemplares e ON p.ejemplar_id = e.id  /* Unir con ejemplares */
            JOIN estados_prestamo ep ON p.estado_prestamo_id = ep.id
            ORDER BY p.fecha_prestamo DESC
        `);
        // No se incluye p.usuario_id para cumplir el requisito de simplificación.

        res.json(prestamos);
    } catch (error) {
        console.error('Error al obtener vista de préstamos para admin:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// RUTA PARA QUE UN USUARIO VEA SUS PROPIOS PRÉSTAMOS
// Protegida por keycloak.protect() en server.js
router.get('/mis-prestamos', async (req, res) => {
    let usuario_id;

    if (!req.kauth || !req.kauth.grant || !req.kauth.grant.access_token || !req.kauth.grant.access_token.content) {
        return res.status(401).json({ message: 'Token de autenticación no encontrado o inválido.' });
    }
    usuario_id = req.kauth.grant.access_token.content.sub;

    try {
        const pool = await getPool();
        const [prestamos] = await pool.query(`
            SELECT 
                p.id AS prestamo_id,
                l.titulo AS libro_titulo,
                e.codigo_ejemplar AS codigo_del_ejemplar,
                p.fecha_prestamo,
                p.fecha_devolucion_estimada,
                p.fecha_devolucion_real,
                ep.nombre_estado AS estado_del_prestamo
            FROM prestamos p
            JOIN libros l ON p.libro_id = l.id
            JOIN ejemplares e ON p.ejemplar_id = e.id /* Unir con ejemplares */
            JOIN estados_prestamo ep ON p.estado_prestamo_id = ep.id
            WHERE p.usuario_id = ?
            ORDER BY p.fecha_prestamo DESC
        `, [usuario_id]);

        res.json(prestamos);
    } catch (error){
        console.error('Error al obtener mis préstamos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;