# ════════════════════════════════════════════════════════════════
# Stage 1 — Builder
# Compile TypeScript, génère le client Prisma
# ════════════════════════════════════════════════════════════════
FROM node:20.18.0-alpine AS builder

WORKDIR /app

# Copier les manifestes workspace en premier (cache layer)
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Installer toutes les dépendances (dev incluses pour la compilation)
RUN npm ci --workspace=apps/backend

# Copier le schéma Prisma et générer le client
COPY apps/backend/prisma ./apps/backend/prisma
RUN cd apps/backend && npx prisma generate

# Copier les sources et compiler
COPY apps/backend/tsconfig*.json ./apps/backend/
COPY apps/backend/nest-cli.json ./apps/backend/
COPY apps/backend/src ./apps/backend/src
RUN cd apps/backend && npm run build


# ════════════════════════════════════════════════════════════════
# Stage 2 — Runner
# Image de production allégée, utilisateur non-root
# ════════════════════════════════════════════════════════════════
FROM node:20.18.0-alpine AS runner

# Utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S dinawa && \
    adduser -u 1001 -S dinawa -G dinawa

WORKDIR /app

# Copier les manifestes workspace
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Installer uniquement les dépendances de production
RUN npm ci --workspace=apps/backend --omit=dev && \
    npm cache clean --force

# Copier le schéma et les migrations Prisma (requis pour migrate deploy)
COPY apps/backend/prisma ./apps/backend/prisma

# Générer le client Prisma dans l'env de production
RUN cd apps/backend && npx prisma generate

# Copier le code compilé depuis le builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Changer le propriétaire des fichiers
RUN chown -R dinawa:dinawa /app

USER dinawa

EXPOSE 3000

# Health check sur /health/live (léger, sans dépendances DB)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/health/live || exit 1

# Exécuter les migrations puis démarrer l'application
CMD ["sh", "-c", "cd apps/backend && npx prisma migrate deploy && node dist/main"]
