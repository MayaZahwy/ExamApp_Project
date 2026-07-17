# Build from repo root:
#   docker build -f services/exams/Dockerfile .
FROM node:20-alpine

WORKDIR /app

COPY packages/common ./packages/common
WORKDIR /app/packages/common
RUN npm install --omit=dev

WORKDIR /app
COPY services/exams/package.json ./services/exams/
WORKDIR /app/services/exams
RUN npm install --omit=dev

COPY services/exams/src ./src

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

CMD ["npm", "start"]
