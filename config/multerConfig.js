import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinaryConfig.js"; 

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "samples/hr3", 
      resource_type: "auto", 
      allowed_formats: ["jpg", "png", "pdf", "docx", "txt"],
      upload_preset: "public_raw_upload", 
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    },
  });

const upload = multer({ storage: storage });

export default upload;
