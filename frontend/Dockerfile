FROM node:18-alpine
EXPOSE 5000

RUN npm install -g nodemon

WORKDIR /app
COPY . .

RUN npm install

ENTRYPOINT [ "npm", "run", "dev" ] 