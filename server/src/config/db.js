const mongoose = require('mongoose');
const dns = require('dns');

// Configure fallback DNS servers to resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore in environments where setting DNS servers is restricted
}

const formatMongoUri = (rawUri) => {
  if (!rawUri) return 'mongodb://127.0.0.1:27017/connectly';
  let uri = rawUri.trim();
  // Strip enclosing quotes if user pasted with quotes
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  // Ensure default database name if missing before query parameters in Atlas URI
  if (uri.includes('.mongodb.net/?')) {
    uri = uri.replace('.mongodb.net/?', '.mongodb.net/connectly?');
  } else if (uri.endsWith('.mongodb.net/')) {
    uri = uri + 'connectly';
  } else if (uri.endsWith('.mongodb.net')) {
    uri = uri + '/connectly';
  }
  return uri;
};

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/connectly';
    const mongoUri = formatMongoUri(rawUri);

    // Mask credentials in log for security
    const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log(`[MongoDB] Connecting to: ${maskedUri}`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.error(`[MongoDB] Troubleshooting tips:`);
    console.error(` 1. Verify MONGO_URI in your host Environment Variables`);
    console.error(` 2. In MongoDB Atlas -> Network Access, ensure IP 0.0.0.0/0 (Allow from Anywhere) is active`);
    console.error(` 3. Check Database Access user permissions & password in MongoDB Atlas`);
    process.exit(1);
  }
};

module.exports = connectDB;
