FROM node:10


WORKDIR /usr/src/app


COPY . .

RUN npm install -g sass && npm install
RUN npm run compile-sass


EXPOSE 3000


CMD ["npm", "start"]