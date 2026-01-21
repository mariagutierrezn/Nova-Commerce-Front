# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Stage 2: Serve con nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copiar archivos construidos
# Angular 21 con nuevo builder usa: dist/nova-commerce-front/browser
COPY --from=build /app/dist/nova-commerce-front/browser .

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
