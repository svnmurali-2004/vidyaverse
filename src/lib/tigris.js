import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { env } from './env';

// Configure AWS SDK v3 for Tigris S3
const s3Client = new S3Client({
  credentials: {
    accessKeyId: env.TIGRIS_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.TIGRIS_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY,
  },
  region: env.TIGRIS_REGION || env.AWS_REGION || 'auto',
  endpoint: env.TIGRIS_ENDPOINT || env.AWS_ENDPOINT_URL_S3 || 'https://t3.storage.dev',
  forcePathStyle: true, // Required for Tigris
});

/**
 * Upload a file to Tigris S3 bucket
 * @param {File} file - The file to upload
 * @param {string} folder - The folder path (e.g., 'courses/thumbnails')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export async function uploadToTigris(file, folder = 'uploads') {
  try {
    const bucketName = env.TIGRIS_BUCKET_NAME || 'vidyaverse-storage'; // Default bucket name
    
    if (!bucketName) {
      throw new Error('Tigris bucket name not configured');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload parameters for AWS SDK v3
    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Make the file publicly accessible
    };

    // Use the new Upload class from AWS SDK v3
    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    const result = await upload.done();
    
    // Construct the public URL manually since Tigris doesn't return Location
    const publicUrl = `${env.TIGRIS_ENDPOINT || 'https://t3.storage.dev'}/${bucketName}/${fileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Tigris:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * Delete a file from Tigris S3 bucket
 * @param {string} fileUrl - The public URL of the file to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteFromTigris(fileUrl) {
  try {
    if (!env.TIGRIS_BUCKET_NAME) {
      throw new Error('Tigris bucket name not configured');
    }

    // Extract key from URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const deleteParams = {
      Bucket: env.TIGRIS_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(deleteParams).promise();
    return true;
  } catch (error) {
    console.error('Error deleting from Tigris:', error);
    return false;
  }
}

/**
 * Generate a presigned URL for direct upload from client
 * @param {string} fileName - The name of the file
 * @param {string} fileType - The MIME type of the file
 * @param {string} folder - The folder path
 * @returns {Promise<{uploadUrl: string, fileUrl: string}>}
 */
export async function generatePresignedUrl(fileName, fileType, folder = 'uploads') {
  try {
    if (!env.TIGRIS_BUCKET_NAME) {
      throw new Error('Tigris bucket name not configured');
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop();
    const key = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    const uploadUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: env.TIGRIS_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ACL: 'public-read',
      Expires: 60 * 5, // 5 minutes
    });

    const fileUrl = `${env.TIGRIS_ENDPOINT}/${env.TIGRIS_BUCKET_NAME}/${key}`;

    return { uploadUrl, fileUrl };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}
