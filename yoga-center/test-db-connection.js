import "dotenv/config";
import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    console.error("FATAL ERROR: MONGODB_URI is not defined in environment variables");
    process.exit(1);
}

console.log("Testing MongoDB connection...");
console.log("URI:", mongoUri.replace(/:([^:@]+)@/, ":****@")); // Hide password in logs

const mongooseOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
});

async function testConnection() {
    try {
        await mongoose.connect(mongoUri, mongooseOptions);
        console.log("Connection successful!");
        console.log("ReadyState:", mongoose.connection.readyState);

        // Simple query to verify
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        await mongoose.disconnect();
        console.log("Disconnected successfully");
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

testConnection();
