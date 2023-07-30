FROM node:18-alpine AS buildJS
WORKDIR /usr/src/app/buildJS

COPY package.json package-lock.json ./
COPY tsconfig*.json ./
COPY ./src ./src
RUN npm ci --quiet && npm run build

FROM node:18-alpine AS buildProdPackages
WORKDIR /usr/src/app/buildProdPackages

COPY package.json package-lock.json ./
RUN npm ci --quite --only=production

FROM node:18-alpine
WORKDIR /app

COPY package.json ./
COPY --from=buildJS /usr/src/app/buildJS/dist ./dist
COPY --from=buildProdPackages /usr/src/app/buildProdPackages/node_modules ./node_modules

# email template and locale folder
COPY ./templates ./templates

EXPOSE 8888

CMD ["node", "dist/app.js"]