// cloudinary-test.js
import 'dotenv/config'; // loads .env automatically
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
  try {
    const filePath = path.join(process.cwd(), 'test.jpg'); // replace with your file
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'test_uploads', // optional folder in Cloudinary
    });

    console.log('Upload successful! URL:', result.secure_url);
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
  }
}

testUpload();