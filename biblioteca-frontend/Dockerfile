# Dockerfile para Angular frontend
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --configuration=production

# Etapa para servir con NGINX
FROM nginx:alpine

# Copiar el build de Angular al directorio que NGINX sirve
COPY --from=builder /app/dist/biblioteca-frontend/browser /usr/share/nginx/html

# Copiar configuración personalizada de NGINX si tienes (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]