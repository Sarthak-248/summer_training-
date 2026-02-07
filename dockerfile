FROM node:18-bullseye

# Install system dependencies for Tesseract and Poppler
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  python3-venv \
  tesseract-ocr \
  poppler-utils \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json* ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install Python dependencies
# Check if requirements.txt exists and install
RUN if [ -f requirements.txt ]; then \
      pip3 install -r requirements.txt; \
    fi

# Expose the port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]
