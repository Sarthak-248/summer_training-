# Use official Node.js LTS Alpine image for smaller size and faster builds
FROM node:18-alpine

# Install Python3, pip, Tesseract OCR, and Poppler-utils
RUN apk add --no-cache python3 py3-pip tesseract-ocr poppler-utils

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --only=production

# Copy requirements.txt and install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port (Render will override with PORT env var)
EXPOSE 10000

# Start the application
CMD ["npm", "start"]
