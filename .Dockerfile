FROM node:18-alpine AS buildapp
WORKDIR /webapp
COPY ./webapp ./
COPY ./docker-webapp-startup.sh ./
RUN chmod +x ./docker-webapp-startup.sh
RUN npm install
RUN npm run build

FROM nginx:1-alpine
COPY --from=buildapp /webapp/dist /usr/share/nginx/html
COPY --from=buildapp /webapp/docker-webapp-startup.sh /docker-entrypoint.d/docker-webapp-startup.sh