# Build stage
FROM node:20-alpine as build-stage
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy static files
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
Broadway
