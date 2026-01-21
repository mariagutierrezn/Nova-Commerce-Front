# Nova Commerce Frontend - Docker Compose

Este documento explica cómo ejecutar el frontend de Nova Commerce usando Docker Compose.

## 📋 Requisitos Previos

- Docker Desktop instalado y corriendo
- Docker Compose v3.8 o superior
- Backend corriendo (local o remoto)

## 🚀 Inicio Rápido

### Opción 1: Frontend con Backend Local

Si el backend está corriendo localmente (en tu máquina):

```bash
cd Nova-Commerce-Front
docker-compose up -d
```

El frontend se conectará automáticamente al backend en `http://host.docker.internal:8080`.

### Opción 2: Frontend con Backend Remoto

Si el backend está en otro servidor o contenedor:

```bash
# Configurar URL del backend
export API_GATEWAY_URL=http://tu-servidor:8080

cd Nova-Commerce-Front
docker-compose up -d
```

O edita `docker-compose.yml`:

```yaml
environment:
  API_GATEWAY_URL: http://tu-servidor:8080
```

## 🔍 Verificar Estado

### Ver servicio corriendo

```bash
docker-compose ps
```

### Verificar salud

```bash
curl http://localhost:4200
```

### Ver logs

```bash
docker-compose logs -f frontend
```

## 🌐 Acceso

- **Frontend**: http://localhost:4200
- El frontend se conecta al API Gateway configurado

## 🔧 Configuración

### Cambiar URL del Backend

Edita `docker-compose.yml`:

```yaml
environment:
  API_GATEWAY_URL: http://nueva-url:8080
```

O usa variable de entorno:

```bash
API_GATEWAY_URL=http://localhost:8080 docker-compose up -d
```

### Configurar Nginx

El archivo `nginx.conf` en `nova-commerce-front/` contiene:
- Proxy para `/api` hacia el API Gateway
- Configuración de SPA (Single Page Application)
- Cache de assets estáticos

## 🛠️ Comandos Útiles

### Reconstruir imagen

```bash
docker-compose build --no-cache
```

### Reiniciar servicio

```bash
docker-compose restart frontend
```

### Detener servicio

```bash
docker-compose down
```

## 🐛 Troubleshooting

### Frontend no carga

1. Verifica que el contenedor esté corriendo:
   ```bash
   docker-compose ps
   ```

2. Verifica logs:
   ```bash
   docker-compose logs frontend
   ```

3. Verifica que el puerto 4200 no esté en uso

### No conecta al backend

1. Verifica la URL del API Gateway:
   ```bash
   docker-compose exec frontend env | grep API_GATEWAY_URL
   ```

2. Si el backend está en otro contenedor, usa el nombre del servicio:
   - `http://nova-gateway:8080` (si están en la misma red Docker)

3. Si el backend está local, usa:
   - `http://host.docker.internal:8080` (Windows/Mac)
   - `http://172.17.0.1:8080` (Linux)

---

**Desarrollado con ❤️ por Leonardo Pérez**
