# ---- Stage 1: deps (install dependencies, cached layer) ----
FROM node:20-alpine AS deps
WORKDIR /app

COPY src/Frontend/package.json src/Frontend/package-lock.json ./
RUN npm ci

# ---- Stage 2: dev (Vite dev server with HMR) ----
FROM node:20-alpine AS dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src/Frontend/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---- Stage 3: build ----
FROM deps AS build
WORKDIR /app

COPY src/Frontend/ .

RUN npm run build

# ---- Stage 4: prod (Nginx serving static assets) ----
FROM nginx:alpine AS prod

COPY --from=build /app/dist /usr/share/nginx/html
COPY src/Frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1
