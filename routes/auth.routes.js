const express = require("express");
const Keycloak = require("keycloak-connect");
const { register } = require("../controllers/auth.controller");

const router = express.Router();
const keycloak = new Keycloak({}); // Configura Keycloak con tu instancia

// Registrar usuario (Protegido)
router.post("/register", keycloak.protect(), (req, res) => register(req, res));

// Endpoint solo accesible para administradores
router.get("/admin-endpoint", keycloak.protect("realm:admin"), (req, res) => {
    res.json({ message: "Solo usuarios con rol admin pueden acceder aquí 🚀" });
});

module.exports = router;
