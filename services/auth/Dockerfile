# Build from repo root:
#   docker build -f services/auth/Dockerfile .
FROM node:20-alpine

WORKDIR /app

COPY packages/common ./packages/common
WORKDIR /app/packages/common
RUN npm install --omit=dev

WORKDIR /app
COPY services/auth/package.json ./services/auth/
WORKDIR /app/services/auth
RUN npm install --omit=dev

COPY services/auth/src ./src

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]
