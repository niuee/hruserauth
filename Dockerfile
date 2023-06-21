FROM node:lts-alpine3.18
ARG EXPOSE_PORT=5000
WORKDIR /home/node/app
COPY . /home/node/app/
RUN npm install
RUN npm run build
EXPOSE $EXPOSE_PORT
CMD npm start ${EXPORE_PORT}
