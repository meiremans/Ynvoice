FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./


#hacky workaround for phantomjs.
#This is a BUG in phantomJS open since 2019.
#In newer distro's (like the one node:16 is based upon) this causes problems https://github.com/bazelbuild/rules_closure/issues/351
ENV OPENSSL_CONF=/dev/null



RUN npm install --only=production

# Bundle app source
COPY . .


EXPOSE 8080
CMD [ "npm", "start" ]
