FROM node:16.17.0 as build

WORKDIR /app
COPY package.json /app/
COPY yarn.lock /app/
RUN yarn install

COPY . /app/
RUN yarn run build

EXPOSE 5500

ENTRYPOINT [ "yarn", "run", "serve", "-s", "/app/dist/", "-p", "5500" ]