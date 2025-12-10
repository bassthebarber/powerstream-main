import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = "mongodb+srv://powerstream:Powerstream1234@cluster0.ldmtan.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged Cluster0 — You successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("❌ Connection error:", error.message);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
