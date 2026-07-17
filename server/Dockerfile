# Express API — used by Docker Compose (local) and Render (production).
# Database stays on hosted Supabase via DATABASE_URL (no Postgres in this image).
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
