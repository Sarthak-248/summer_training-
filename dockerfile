# Base image with Node.js and Debian
FROM node:18-bullseye

# Install Python, Tesseract, and Poppler
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Node dependencies and install
COPY package*.json ./
RUN npm install

# Copy Python requirements and install
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy rest of the project
COPY . .

# Install concurrently for running Node + Python
RUN npm install -g concurrently

# Expose backend port
EXPOSE 5000

# Start both services
CMD ["concurrently", "python3 ml_service/server.py", "npm start"]
