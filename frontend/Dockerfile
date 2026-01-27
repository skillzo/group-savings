#Build stage
FROM node:20-alpine AS builder

# Set the working directory to /app
WORKDIR /app

# Copy only the package.json to the working directory to avoid copying the node_modules directory
COPY package.json .

# Install dependencies using npm ci to avoid warnings
RUN npm ci

# Copy all the remaining files to the working directory
COPY . .

RUN npm run build



#Production stage
FROM nginx:alpine

#copy build stage to production stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf  /etc/nginx/conf.d/default.conf


# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]