# backend/Dockerfile

# Etapa 1: Construcción (build)
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Generar Prisma Client
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

# Compilar TypeScript a JavaScript
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
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Cambiar a usuario no root
USER nodejs

# Exponer puerto
EXPOSE 3005

# Comando para iniciar la app
CMD ["node", "dist/server.js"]
