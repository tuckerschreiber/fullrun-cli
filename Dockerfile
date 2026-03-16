FROM node:22-alpine AS build
WORKDIR /app
COPY mcp/package.json mcp/package-lock.json ./
RUN npm install --omit=dev
COPY mcp/dist/ ./dist/

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["node", "dist/server.js"]
