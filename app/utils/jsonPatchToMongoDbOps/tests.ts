const { MongoClient } = require("mongodb");
const stringifyJson = require("json-stable-stringify");

const { jsonPatchToMongoDbOps } = require("./jsonPatchToMongoDbOps");
const examples = require("./examples.json");

MongoClient.connect("mongodb://admin:localpasswd@localhost:27017/", {
  maxIdleTimeMS: 100000,
  serverSelectionTimeoutMS: 100000,
  socketTimeoutMS: 200000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async (client) => {
  const db = client.db("test");

  try {
    await db.createCollection("test");
  } catch (error) {}

  await Promise.all(
    examples.map(async (example, index) => {
      try {
        const { insertedId } = await db
          .collection("test")
          .insertOne(example.doc);
        const ops = await jsonPatchToMongoDbOps(
          example.patch,
          { _id: insertedId },
          db.collection("test")
        );
        await db.collection("test").bulkWrite(ops);
        const changedDoc = await db
          .collection("test")
          .findOne({ _id: insertedId });
        delete changedDoc._id;
        const resultString = stringifyJson(changedDoc);
        const expectedString = stringifyJson(example.expected);
        if (resultString === expectedString) {
          console.debug(
            `Test ${index + 1} (${example.comment || "-"}) worked!`
          );
        } else {
          console.debug(
            `Test ${index + 1} (${example.comment || "-"}) ${
              !example.expected
                ? "has result, but is supposed to fail"
                : "didn't work"
            }.
              Expected: ${expectedString}.
              Result was: ${resultString}.
              Patch: ${JSON.stringify(example.patch)}.
              Mongo DB ops: ${JSON.stringify(ops)}`
          );
        }
      } catch (error) {
        if (!example.expected) {
          console.debug(
            `Test ${index + 1} (${
              example.comment || "-"
            }) worked (failed as expected)!`
          );
        } else {
          console.debug(
            `Test ${index + 1} (${example.comment || "-"}) errored: ${error}.
             Patch: ${JSON.stringify(example.patch)}
            `
          );
        }
      }
    })
  );

  await db.collection("test").drop();

  process.exit(0);
});

export {};
