# Use Ubuntu 22.04 for better ML library compatibility
FROM ubuntu:22.04

# Install system dependencies for Tesseract, Poppler, Python, and build tools
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-dev \
    tesseract-ocr poppler-utils \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

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
