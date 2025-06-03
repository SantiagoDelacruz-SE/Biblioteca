# Proyecto Biblioteca - LibrisNet

Este proyecto es un sistema de gestión de bibliotecas full-stack que incluye un frontend desarrollado con Angular y un backend con Node.js y Express, utilizando PostgreSQL como base de datos. La autenticación y autorización se manejan con Keycloak.

## Características Principales

* **Frontend (Angular):**
    * Interfaz de usuario para interactuar con el sistema.
    * Componentes para listar y gestionar libros, autores y categorías.
    * Integración con Keycloak para la autenticación de usuarios y roles.
    * Uso de Tailwind CSS y DaisyUI para estilos.
* **Backend (Node.js/Express):**
    * API REST para gestionar recursos como libros, autores, categorías, usuarios, préstamos y multas.
    * Conexión a una base de datos PostgreSQL.
    * Integración con Keycloak para proteger rutas y gestionar la autenticación.
    * Documentación de la API con Swagger.
* **Autenticación (Keycloak):**
    * Servidor de autenticación independiente configurado para el proyecto.
    * Definición de un realm (`biblioteca-realm`) y clientes para frontend y backend.
    * Tema personalizado para la pantalla de login de Keycloak.
* **Base de Datos (PostgreSQL):**
    * Esquema de base de datos definido en `init.sql` para crear las tablas necesarias.
* **Dockerización:**
    * Configuración con `docker-compose.yml` para levantar todos los servicios (frontend, backend, base de datos PostgreSQL para la aplicación, base de datos PostgreSQL para Keycloak y Keycloak mismo).

## Estructura del Repositorio

El repositorio está organizado de la siguiente manera:

* `/`: Contiene los archivos del backend, configuración de Docker y Keycloak.
    * `config/`: Configuración de la base de datos del backend.
    * `controllers/`: Lógica de control para las rutas del backend (ej. `auth.controller.js`).
    * `keycloak/`:
        * `reino/`: Exportación del realm de Keycloak (`realm-export.json`).
        * `tema-keycloak/`: Archivos del tema personalizado para el login de Keycloak.
    * `models/`: Definiciones de modelos (aunque `User.js` parece estar comentado).
    * `routes/`: Definición de las rutas de la API del backend (ej. `libros.routes.js`, `autores.routes.js`).
    * `biblioteca-frontend/`: Contiene el proyecto frontend de Angular.
        * `src/`: Código fuente del frontend.
            * `app/`: Componentes principales, servicios y configuración de la aplicación Angular.
                * `components/`: Componentes de la interfaz de usuario (listas, home, login).
                * `services/`: Servicios para la lógica de negocio (auth, libros, autores, categorías).
                * `assets/`: Archivos estáticos, incluyendo `silent-check-sso.html` para Keycloak.
            * `environments/`: (No visible en los archivos, pero típico en Angular para configuraciones de entorno).
        * `angular.json`: Configuración del CLI de Angular.
        * `package.json`: Dependencias y scripts del frontend.
        * `tailwind.config.js`: Configuración de Tailwind CSS.
    * `docker-compose.yml`: Define los servicios y cómo se ejecutan juntos.
    * `init.sql`: Script SQL para inicializar la base de datos de la aplicación.
    * `keycloak.json`: Configuración del adaptador de Keycloak para el backend.
    * `package.json`: Dependencias y scripts del backend.
    * `server.js`: Punto de entrada principal del servidor backend.
    * `swagger.yaml`: Definición de la API para la documentación con Swagger.

## Requisitos Previos

* Docker y Docker Compose instalados.
* Node.js y npm (o yarn) si deseas ejecutar los proyectos fuera de Docker.
* Angular CLI instalado globalmente si deseas modificar el frontend localmente (`npm install -g @angular/cli`).

## Cómo Usar el Repositorio

### 1. Levantamiento con Docker Compose

La forma más sencilla de poner en marcha todo el sistema es utilizando Docker Compose.

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/santiagodelacruz-se/biblioteca.git](https://github.com/santiagodelacruz-se/biblioteca.git)
    cd biblioteca
    ```

2.  **Inicia los servicios:**
    Desde la raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`), ejecuta:
    ```bash
    docker-compose up --build
    ```
    El flag `--build` asegura que las imágenes de Docker se construyan si no existen o si ha habido cambios (por ejemplo, en el `Dockerfile` del backend o del frontend).

3.  **Acceso a los servicios:**
    * **Frontend (LibrisNet):** `http://localhost:4200`
    * **Backend API:** `http://localhost:5000`
    * **Documentación Swagger API:** `http://localhost:5000/api-docs`
    * **Keycloak Admin Console:** `http://localhost:8080`
        * Usuario: `admin`
        * Contraseña: `admin`
        * Realm: `biblioteca-realm`

    La primera vez que Keycloak se inicia, importará la configuración del realm desde `./keycloak/reino/realm-export.json`.
    La base de datos de la aplicación se inicializará con el script `init.sql`.

### 2. Desarrollo del Frontend (Angular)

Si deseas trabajar directamente en el frontend:

1.  **Navega al directorio del frontend:**
    ```bash
    cd biblioteca-frontend
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Inicia el servidor de desarrollo de Angular:**
    ```bash
    ng serve
    ```
    Esto levantará el frontend en `http://localhost:4200/`. El servidor se recargará automáticamente si modificas los archivos fuente.

4.  **Otros comandos útiles del frontend:**
    * Construir el proyecto: `ng build` (los artefactos se guardan en `dist/`)
    * Ejecutar tests unitarios: `ng test`
    * Generar componentes: `ng generate component nombre-componente`

### 3. Desarrollo del Backend (Node.js)

Si deseas trabajar directamente en el backend (asegúrate de tener PostgreSQL y Keycloak corriendo, ya sea localmente o vía Docker):

1.  **Navega al directorio raíz del proyecto.**

2.  **Instala las dependencias del backend:**
    ```bash
    npm install
    ```

3.  **Configura las variables de entorno:**
    Crea un archivo `.env` en la raíz del backend basándote en las necesidades de `server.js` y `config/database.js`. Como mínimo, necesitarás `DATABASE_URL` si no está configurado para tomar los valores por defecto de Docker.

4.  **Inicia el servidor de Node.js:**
    ```bash
    node server.js
    ```
    O utiliza `nodemon` si lo tienes instalado para recarga automática: `nodemon server.js`.

## Configuración de Keycloak

* **Realm:** `biblioteca-realm`
* **URL del Servidor:** `http://localhost:8080`
* **Cliente Frontend:** `biblioteca-frontend-client` (público)
    * Redirect URIs: `http://localhost:4200/*`
    * Web Origins: `http://localhost:4200`
* **Cliente Backend:** `biblioteca-backend` (público o confidencial, según `keycloak.json`)
    * Redirect URIs: `http://localhost:5000/*`
    * Web Origins: `http://localhost:5000`

* **Usuarios de prueba (según `realm-export.json`):**
    * admin / admin
    * juanito / (contraseña configurada en Keycloak)
    * tester / (contraseña configurada en Keycloak)

* **Roles Importantes:**
    * `realm-admin`: Utilizado para proteger rutas de administración en el backend. El frontend también verifica este rol para mostrar/ocultar funcionalidades.
