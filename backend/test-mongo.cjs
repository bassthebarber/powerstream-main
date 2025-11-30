// backend/scripts/test-mongo.cjs
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI || `mongodb+srv://powerstream:powerstream@cluster0.ldmtan.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Pinged your deployment. Connection OK!');
  } catch (e) {
    console.error('❌ FAILED:', e.message);
  } finally {
    await client.close();
  }
}
run();
