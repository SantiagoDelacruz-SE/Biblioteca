# Usamos una imagen base oficial de Node.js
FROM node:16

# Configuramos el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos los archivos package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalamos las dependencias del proyecto
RUN npm install

# Copiamos todo el código fuente al contenedor
COPY . .

# Exponemos el puerto en el que el servidor va a correr
EXPOSE 5000

# Definimos el comando para ejecutar el servidor
CMD ["node", "server.js"]
