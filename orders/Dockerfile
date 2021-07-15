from node:alpine

WORKDIR /app
COPY package.json .
RUN npm install -registry=http://registry.npmjs.org/ 
# RUN npm install --only=production
COPY . .

CMD ["npm", "start"]
