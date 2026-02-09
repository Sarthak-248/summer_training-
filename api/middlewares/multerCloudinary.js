import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'doctor-listings', // Cloudinary folder name
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

// Separate storage for patient profiles
const patientStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'patient-profiles', // Cloudinary folder name for patient photos
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const parser = multer({ storage });
const patientParser = multer({ storage: patientStorage });

export { patientParser };
export default parser;
