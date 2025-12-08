import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Event from './models/Event.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    console.error("FATAL ERROR: MONGODB_URI is not defined");
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

const migrateImages = async () => {
    await connectDB();

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'
    });

    try {
        const events = await Event.find();
        console.log(`Found ${events.length} events to check.`);

        for (const event of events) {
            let eventUpdated = false;

            // 1. Check Event Cover Image
            if (event.image && event.image.startsWith('/uploads/')) {
                const localPath = path.join(process.cwd(), event.image);
                if (fs.existsSync(localPath)) {
                    console.log(`Migrating cover image for event ${event.title}: ${localPath}`);
                    const filename = `${Date.now()}-${path.basename(localPath)}`;

                    await new Promise((resolve, reject) => {
                        fs.createReadStream(localPath)
                            .pipe(bucket.openUploadStream(filename))
                            .on('error', reject)
                            .on('finish', resolve);
                    });

                    event.image = `/api/images/${filename}`;
                    eventUpdated = true;
                    console.log(`Cover image migrated to: ${event.image}`);
                } else {
                    console.warn(`Cover image file not found: ${localPath}`);
                }
            }

            // 2. Check Event Photos
            if (event.photos && event.photos.length > 0) {
                for (const photo of event.photos) {
                    let photoPath = photo.url || photo.path; // Handle both url and legacy path fields

                    // Construct full local path if it's a relative path not starting with /uploads
                    if (photoPath && !photoPath.startsWith('/uploads/') && !photoPath.startsWith('/api/')) {
                        // Legacy logic from api.js: /uploads/events/${event._id}/photos/${photo.path}
                        photoPath = `/uploads/events/${event._id}/photos/${photoPath}`;
                    }

                    if (photoPath && photoPath.startsWith('/uploads/')) {
                        const localPath = path.join(process.cwd(), photoPath);

                        // Try to find the file. Sometimes the path in DB might be slightly off or URL encoded
                        let fileExists = fs.existsSync(localPath);
                        let finalLocalPath = localPath;

                        if (!fileExists) {
                            // Try decoding URI component
                            try {
                                const decodedPath = decodeURIComponent(localPath);
                                if (fs.existsSync(decodedPath)) {
                                    finalLocalPath = decodedPath;
                                    fileExists = true;
                                }
                            } catch (e) { }
                        }

                        if (fileExists) {
                            console.log(`Migrating photo for event ${event.title}: ${finalLocalPath}`);
                            const filename = `${Date.now()}-${path.basename(finalLocalPath)}`;

                            await new Promise((resolve, reject) => {
                                fs.createReadStream(finalLocalPath)
                                    .pipe(bucket.openUploadStream(filename))
                                    .on('error', reject)
                                    .on('finish', resolve);
                            });

                            photo.url = `/api/images/${filename}`;
                            eventUpdated = true;
                            console.log(`Photo migrated to: ${photo.url}`);
                        } else {
                            console.warn(`Photo file not found: ${localPath}`);
                        }
                    }
                }
            }

            if (eventUpdated) {
                await event.save();
                console.log(`Event ${event.title} updated with new image URLs.`);
            }
        }

        console.log("Migration completed.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

migrateImages();
