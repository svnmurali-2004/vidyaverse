# Add these variables to your .env file for Tigris S3 integration

# Tigris S3 Storage Configuration
TIGRIS_ACCESS_KEY_ID=your_tigris_access_key_id
TIGRIS_SECRET_ACCESS_KEY=your_tigris_secret_access_key
TIGRIS_BUCKET_NAME=your_bucket_name
TIGRIS_REGION=auto
TIGRIS_ENDPOINT=https://fly.storage.tigris.dev

# Example values (replace with your actual values):
# TIGRIS_ACCESS_KEY_ID=tid_abc123def456
# TIGRIS_SECRET_ACCESS_KEY=tsec_xyz789abc123
# TIGRIS_BUCKET_NAME=vidyaverse-storage
# TIGRIS_REGION=auto
# TIGRIS_ENDPOINT=https://fly.storage.tigris.dev

# Notes:
# - Get your access keys from Tigris console: https://console.tigris.dev
# - Make sure your bucket is set to public read access for uploaded images
# - The bucket should be created before running the application
