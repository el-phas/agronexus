import multer from 'multer';

// Use memory storage and stream buffers to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
