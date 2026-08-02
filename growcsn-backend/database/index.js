const mongoose = require('mongoose');

// Set mongoose mode to strict and deactive auto indexing
mongoose.set('strictQuery', true);
mongoose.set('autoIndex', false);

const normalizeMongoUri = (uri) => {
    if (!uri || !(uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))) {
        return uri;
    }

    try {
        const url = new URL(uri);
        const username = url.username || '';
        const password = url.password || '';

        const safeUsername = username ? encodeURIComponent(decodeURIComponent(username)) : username;
        const safePassword = password ? encodeURIComponent(decodeURIComponent(password)) : password;

        if (safeUsername !== username || safePassword !== password) {
            url.username = safeUsername;
            url.password = safePassword;
            return url.toString();
        }
    } catch (err) {
        // If parsing fails, fall back to the original URI.
    }

    return uri;
};

const connectDB = async () => {
    const rawUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
    if (!rawUri) {
        console.error('Error: DATABASE_URI or MONGODB_URI environment variable is not set');
        process.exit(1);
    }

    const mongoUri = normalizeMongoUri(rawUri);

    try {
        const conn = await mongoose.connect(mongoUri, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
