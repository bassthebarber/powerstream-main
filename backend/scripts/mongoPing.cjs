// mongoPing.cjs (CommonJS)
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = "mongodb+srv://USER:PASS@cluster1.qffsjjz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });
(async () => {
  try { await client.connect(); await client.db("admin").command({ ping: 1 }); console.log("OK"); }
  catch (e) { console.error(e); }
  finally { await client.close(); }
})();
