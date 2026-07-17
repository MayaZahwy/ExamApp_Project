# Build from repo root:
#   docker build -f services/submissions/Dockerfile .
FROM node:20-alpine

WORKDIR /app

COPY packages/common ./packages/common
WORKDIR /app/packages/common
RUN npm install --omit=dev

WORKDIR /app
COPY services/submissions/package.json ./services/submissions/
WORKDIR /app/services/submissions
RUN npm install --omit=dev

COPY services/submissions/src ./src

ENV NODE_ENV=production
ENV PORT=3003

EXPOSE 3003

CMD ["npm", "start"]
