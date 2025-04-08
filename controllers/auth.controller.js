const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// Registrar usuario
const register = async (req, res) => {
    const { nombre, correo, contraseña, rol_id } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { correo } });
        if (existingUser) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Crear usuario
        const newUser = await User.create({
            nombre,
            correo,
            contrasena: hashedPassword,
            rol_id,
        });

        res.status(201).json({ message: "Usuario registrado", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// Iniciar sesión
const login = async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        const user = await User.findOne({ where: { correo } });

        if (!user) {
            return res.status(400).json({ error: "Correo o contraseña incorrectos" });
        }

        const validPassword = await bcrypt.compare(contraseña, user.contrasena);
        if (!validPassword) {
            return res.status(400).json({ error: "Correo o contraseña incorrectos" });
        }

        // Generar token
        const token = jwt.sign({ id: user.id, rol_id: user.rol_id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.json({ message: "Inicio de sesión exitoso", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

module.exports = { register, login };
