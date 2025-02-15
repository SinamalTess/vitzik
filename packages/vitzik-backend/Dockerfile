# Use the official Node.js image as the base image
FROM node:19

# Set the working directory
WORKDIR /app

# Enable Corepack and install a compatible Yarn version
RUN corepack enable \
    && corepack prepare yarn@4.2.2 --activate

# Copy only package.json, yarn.lock, and workspace-specific files
COPY package.json yarn.lock ./

# Copy the entire project context
COPY . .

# Install dependencies
RUN yarn install --immutable

# Expose the backend port (if applicable)
EXPOSE 8080

# Start the backend application
CMD ["yarn", "workspace", "vitzik-backend", "start"]
