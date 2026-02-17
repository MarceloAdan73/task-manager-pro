# frontend/Dockerfile

# Etapa 1: Construcción (build)
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# Etapa 2: Producción (imagen final más pequeña)
FROM node:20-alpine

WORKDIR /app

# Crear usuario no root por seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar archivos necesarios desde builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Cambiar a usuario no root
USER nodejs

# Exponer puerto (Next.js por defecto es 3000)
EXPOSE 3004

# Comando para iniciar la app
CMD ["npm", "start"]
