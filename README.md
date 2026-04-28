# Biblioteca

Sistema de gestión de biblioteca desarrollado con arquitectura MVC, API RESTful documentada y contenedorización completa.

## 🎯 Características

- Arquitectura MVC (Model-View-Controller)
- API RESTful documentada con Swagger
- Contenedorización con Docker y Docker Compose
- Base de datos inicializada con scripts SQL
- 13 commits de desarrollo continuo
- Estructura profesional y mantenible

## 🚀 Tecnologías Utilizadas

- **JavaScript (98.6%)** - Lógica principal de la aplicación
- **Dockerfile (1.4%)** - Contenedorización
- **Node.js** - Entorno de ejecución
- **Swagger** - Documentación de API
- **Docker & Docker Compose** - Orquestación de contenedores
- **SQL** - Base de datos

## 📁 Estructura del Proyecto

```
Biblioteca/
├── server.js                  # Servidor principal
├── config/                    # Configuraciones
├── controllers/               # Controladores MVC
├── models/                    # Modelos de datos
├── routes/                    # Rutas de la API
├── swagger.yaml              # Documentación Swagger
├── docker-compose.yml        # Orquestación Docker
├── Dockerfile                # Imagen Docker
├── init.sql                  # Inicialización de BD
├── .env                      # Variables de entorno
└── package.json              # Dependencias Node.js
```

## 🐳 Despliegue con Docker

### Opción 1: Docker Compose (Recomendado)
```bash
docker-compose up -d
```

### Opción 2: Construcción manual
```bash
docker build -t biblioteca .
docker run -p 3000:3000 biblioteca
```

## 💻 Instalación Local

1. Clona el repositorio:
```bash
git clone https://github.com/SantiagoDelacruz-SE/Biblioteca.git
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
# Edita el archivo .env con tus configuraciones
```

4. Inicializa la base de datos:
```bash
# Ejecuta init.sql en tu gestor de base de datos
```

5. Inicia el servidor:
```bash
npm start
```

## 📚 API Endpoints

La documentación completa de la API está disponible en `/api-docs` una vez iniciado el servidor (Swagger UI).

## 🛠️ Scripts Disponibles

```bash
npm start        # Inicia el servidor
npm run dev      # Inicia con nodemon (desarrollo)
npm test        # Ejecuta pruebas
```

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 👤 Autor

**Santiago Delacruz**
- GitHub: [@SantiagoDelacruz-SE](https://github.com/SantiagoDelacruz-SE)

---
⭐ Si te gusta este proyecto, dale una estrella en GitHub!
