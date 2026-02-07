# Use Ubuntu 22.04 for better ML library compatibility
FROM ubuntu:22.04

# Install ALL required system dependencies in one command
RUN apt-get update && apt-get install -y \
    # Python ecosystem
    python3 python3-pip python3-dev python3-setuptools \
    # Node.js ecosystem tools (install Node 18 later via NodeSource)
    curl gnupg2 ca-certificates \
    # OCR and PDF processing
    tesseract-ocr tesseract-ocr-eng poppler-utils \
    # Build tools for compiling packages
    build-essential gcc g++ make \
    # Scientific computing libraries (BLAS, LAPACK)
    libblas-dev liblapack-dev libatlas-base-dev \
    # Additional libraries for ML and image processing
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 pkg-config \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set working directory
WORKDIR /app

# Copy package files first for caching
# Copy package files first for caching
COPY package*.json ./

# Install Node.js 18 (LTS) from NodeSource for predictable Node version
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get update && apt-get install -y nodejs \
    && npm --version

# Install Node dependencies for the API (production only)
RUN npm install --production --silent --no-audit --no-fund || npm install --silent --no-audit --no-fund

# Copy requirements.txt and install Python dependencies
COPY requirements.txt ./
RUN python3 -m pip install --upgrade pip setuptools wheel \
    && pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Default port and expose (Render will override with PORT env var)
ENV PORT=5000
EXPOSE 5000

# Simple healthcheck so platforms can detect readiness
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Start the application directly (runs server at api/index.js)
CMD ["node", "api/index.js"]
