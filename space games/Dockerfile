FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json vite.config.js ./
COPY public ./public
COPY index.html ./
COPY src ./src
COPY server ./server

RUN npm run build

FROM node:20-alpine AS runtime

RUN addgroup -g 1001 -S orbitforge && adduser -S orbitforge -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && rm -rf /root/.npm

COPY --from=build --chown=orbitforge:orbitforge /app/dist ./dist
COPY --from=build --chown=orbitforge:orbitforge /app/server ./server

USER orbitforge

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "const http=require('http');const req=http.get({host:'localhost',port:process.env.PORT||3001,path:'/api/v1/health',timeout:8000},res=>{process.exit(res.statusCode===200?0:1)});req.on('error',()=>process.exit(1));req.end()"

CMD ["node", "dist/server.js"]
