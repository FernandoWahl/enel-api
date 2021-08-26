FROM alpine:3.7

# Create app directory
WORKDIR /usr/src/Enel-Service

ENV TZ=America/Sao_Paulo
RUN apk add tzdata
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apk add nodejs

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm config set strict-ssl false

# If you are building your code for production
RUN npm install --verbose

# Bundle app source
COPY . .

EXPOSE 40002
CMD [ "npm", "start" ]