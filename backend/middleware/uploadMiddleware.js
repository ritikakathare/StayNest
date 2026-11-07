const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary, enabled } = require("../config/cloudinary");

let upload;

if (enabled) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "airbnb-clone",
      allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
  });
  upload = multer({ storage });
} else {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
      cb(null, `${Date.now()}-${safe}`);
    }
  });
  upload = multer({ storage });
}

module.exports = upload;
