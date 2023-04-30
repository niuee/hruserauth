FROM node
WORKDIR /home/node/app
COPY . /home/node/app/
RUN npm install
RUN npx tsc
EXPOSE 3000
CMD npm start
