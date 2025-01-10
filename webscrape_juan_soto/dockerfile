FROM ghcr.io/puppeteer/puppeteer:23.10.3

# Skip Puppeteer downloading the browser
ENV PUPPETEER_SKIP_DOWNLOAD=true PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json, then install dependencies
COPY package*.json ./
RUN npm ci

# Copy all application files
COPY . .

# Set the default command to start the app
CMD ["node", "index.js"]
