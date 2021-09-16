FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/Enel-Service

ENV TZ=America/Sao_Paulo
RUN apk add tzdata
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

#RUN apk add nodejs

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm config set strict-ssl false

# If you are building your code for production
RUN npm install --verbose --only=production

# Bundle app source
COPY app/ ./app/

EXPOSE 40002
#CMD [ "node", "--version" ]
CMD [ "npm", "run", "start_in_docker" ]