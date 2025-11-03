#!/bin/bash

# SSL Setup script for NAP Management System
set -e

DOMAIN=${1:-localhost}
SSL_DIR="ssl"

echo "🔐 Setting up SSL certificates for domain: $DOMAIN"

# Create SSL directory
mkdir -p "$SSL_DIR"

if [ "$DOMAIN" = "localhost" ]; then
    echo "🏠 Generating self-signed certificates for localhost..."
    
    # Generate private key
    openssl genrsa -out "$SSL_DIR/key.pem" 2048
    
    # Generate certificate signing request
    openssl req -new -key "$SSL_DIR/key.pem" -out "$SSL_DIR/csr.pem" -subj "/C=CO/ST=State/L=City/O=Organization/CN=localhost"
    
    # Generate self-signed certificate
    openssl x509 -req -days 365 -in "$SSL_DIR/csr.pem" -signkey "$SSL_DIR/key.pem" -out "$SSL_DIR/cert.pem"
    
    # Clean up CSR
    rm "$SSL_DIR/csr.pem"
    
    echo "✅ Self-signed certificates generated successfully!"
    echo "⚠️  Note: Self-signed certificates will show security warnings in browsers."
    
else
    echo "🌐 Setting up Let's Encrypt certificates for domain: $DOMAIN"
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        echo "❌ Certbot is not installed. Please install it first:"
        echo "   Ubuntu/Debian: sudo apt-get install certbot"
        echo "   CentOS/RHEL: sudo yum install certbot"
        echo "   macOS: brew install certbot"
        exit 1
    fi
    
    # Generate Let's Encrypt certificate
    certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN"
    
    # Copy certificates to SSL directory
    cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/cert.pem"
    cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/key.pem"
    
    echo "✅ Let's Encrypt certificates installed successfully!"
    
    # Set up auto-renewal
    echo "🔄 Setting up auto-renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
fi

# Set proper permissions
chmod 600 "$SSL_DIR/key.pem"
chmod 644 "$SSL_DIR/cert.pem"

echo "🔒 SSL certificates are ready!"
echo "📁 Certificate location: $SSL_DIR/"
echo "🔑 Private key: $SSL_DIR/key.pem"
echo "📜 Certificate: $SSL_DIR/cert.pem"