ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apk add --no-cache \
    nodejs \
    npm \
    git \
    util-linux

RUN npm config set strict-ssl false

COPY package*.json ./app/
COPY nodemon.json ./app/
COPY properties.json ./app/

RUN cd /app && npm install --verbose --only=production --unsafe-perm

COPY app/ ./app/app/

WORKDIR /app
EXPOSE 40002

# Copy data for add-on
COPY run.sh /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]