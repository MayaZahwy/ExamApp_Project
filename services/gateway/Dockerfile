# Build from repo root:
#   docker build -f services/gateway/Dockerfile .
# Public entrypoint for Vercel / local client (keeps one VITE_API_URL).
FROM node:20-alpine

WORKDIR /app

COPY services/gateway/package.json ./
RUN npm install --omit=dev

COPY services/gateway/src ./src

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
