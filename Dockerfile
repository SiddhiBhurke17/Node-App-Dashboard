# Step 1: Use lightweight Node.js base image
FROM node:18-alpine

# Step 2: Set working directory inside container
WORKDIR /app

# Step 3: Copy package files first (for efficient caching)
COPY package*.json ./

# Step 4: Install only production dependencies
RUN npm install --production

# Step 5: Copy all remaining project files
COPY . .

# Step 6: Expose port for app (matches app.js)
EXPOSE 3000

# Step 7: Start the app
CMD ["npm", "start"]
