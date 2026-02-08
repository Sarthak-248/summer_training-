import mongoose from "mongoose";
import Doctor from "./models/Doctor.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, "../.env") });

const migrateDoctorImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    // Update all doctors that have local image paths to use default avatar
    const result = await Doctor.updateMany(
      {
        imageUrl: { $regex: "^/uploads/" } // Local paths starting with /uploads/
      },
      {
        $set: {
          imageUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=doctor"
        }
      }
    );

    console.log(`✅ Migrated ${result.modifiedCount} doctor images to default avatar`);

    // Also update any doctors that have empty or null imageUrl
    const result2 = await Doctor.updateMany(
      {
        $or: [
          { imageUrl: { $exists: false } },
          { imageUrl: null },
          { imageUrl: "" }
        ]
      },
      {
        $set: {
          imageUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=doctor"
        }
      }
    );

    console.log(`✅ Set default avatar for ${result2.modifiedCount} doctors with missing images`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrateDoctorImages();