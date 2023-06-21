FROM node:lts-alpine3.18
ARG PORT=5000
WORKDIR /home/node/app
COPY . /home/node/app/
RUN npm install
RUN npm run build
EXPOSE ${PORT}
ENV CMD_PORT ${PORT}
CMD npm start $CMD_PORT
