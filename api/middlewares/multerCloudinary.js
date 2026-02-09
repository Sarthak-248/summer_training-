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

// Separate storage for patient reports (images and PDFs)
const reportStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'patient-reports', // Cloudinary folder name for patient reports
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
});

const patientParser = multer({ storage: patientStorage });
const reportParser = multer({ storage: reportStorage });
const patientParser = multer({ storage: patientStorage });

export { patientParser, reportParser };
export default parser;
