# Use an official Node.js 18 runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app


# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

COPY Dependencies/scimmy-1.0.0.tgz ./Dependencies/scimmy-1.0.0.tgz
COPY Dependencies/scimmy-routers-1.0.0.tgz ./Dependencies/scimmy-routers-1.0.0.tgz


# Install the application dependencies
RUN npm install

# Copy the application source code to the working directory
COPY . .

# Expose a port that the container will listen on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]


