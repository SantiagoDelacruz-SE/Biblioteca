const axios = require("axios");

const register = async (req, res) => {
    const { nombre, correo, rol_id, contraseña } = req.body;

    try {
        const keycloakAdminToken = await axios.post("http://localhost:8080/realms/biblioteca-realm/protocol/openid-connect/token", 
        new URLSearchParams({
            client_id: "biblioteca-backend",
            username: "admin",
            password: "admin",
            grant_type: "password"
        }), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        const accessToken = keycloakAdminToken.data.access_token;

        
        const keycloakUser = await axios.post("http://localhost:8080/admin/realms/biblioteca-realm/users", {
            username: correo,
            email: correo,
            firstName: nombre,
            enabled: true,
            credentials: [{ type: "password", value: contraseña, temporary: false }],
            realmRoles: [rol_id]
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        res.status(201).json({ message: "Usuario registrado en Keycloak", user: keycloakUser.data });
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error al registrar el usuario en Keycloak" });
    }
};