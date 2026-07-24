FROM node:22-slim

WORKDIR /app

COPY server/package.json ./server/package.json
COPY server/index.js ./server/index.js

# A base de dados vive num volume persistente montado em /data
ENV DB_PATH=/data/daa.db
ENV PORT=3001

EXPOSE 3001

CMD ["node", "--no-warnings", "server/index.js"]
