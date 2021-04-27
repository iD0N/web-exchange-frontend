# see: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

FROM node:8.11-alpine

# needed by WDIO package
RUN apk add --no-cache g++ make python

WORKDIR /usr/src/app
CMD ["yarn", "start"]
