const path = require("path");
const fs = require("fs");
const { v2: cloudinary } = require("cloudinary");
const supabase = require("../config/supabase");

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Resilient multi-tier upload dispatcher:
 * 1. Cloudinary (if configured)
 * 2. Supabase Storage (if configured & reachable)
 * 3. Local disk fallback (always guaranteed)
 */
async function uploadFileStream(file, folder = "gallery") {
  const ext = path.extname(file.originalname) || ".jpg";
  const cleanBase = path
    .basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `${Date.now()}_${cleanBase}${ext}`;

  // 1. Try Cloudinary if configured
  if (hasCloudinary) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `augu_smart_${folder}`,
            public_id: `${Date.now()}_${cleanBase}`,
            resource_type: "image",
          },
          (error, res) => {
            if (error) return reject(error);
            resolve(res);
          }
        );
        stream.end(file.buffer);
      });

      if (result && (result.secure_url || result.url)) {
        return result.secure_url || result.url;
      }
    } catch (cErr) {
      console.warn("[upload] Cloudinary upload failed, falling back to next provider:", cErr.message);
    }
  }

  // 2. Try Supabase Storage if configured
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    try {
      const { data, error } = await supabase.storage
        .from(folder)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(folder)
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        console.warn(`[upload] Supabase bucket '${folder}' returned error:`, error.message);
      }
    } catch (sErr) {
      console.warn("[upload] Supabase upload failed, falling back to disk storage:", sErr.message);
    }
  }

  // 3. Fallback: Save directly to server disk storage (served at /uploads/:filename)
  const targetDirs = [
    path.join(__dirname, "..", "uploads"),
    path.join(__dirname, "..", "..", "uploads"),
    path.join(__dirname, "..", "..", "Frontend", "public", "uploads"),
  ];

  for (const dir of targetDirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(path.join(dir, fileName), file.buffer);
    } catch (err) {
      // Ignore individual directory write error if another succeeds
    }
  }

  return `/uploads/${fileName}`;
}

module.exports = {
  uploadFileStream,
};
