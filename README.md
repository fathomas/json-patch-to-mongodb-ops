# json-patch-to-mongodb-ops

This repository contains a script written in **TypeScript** to convert [**JSON Patch**](http://tools.ietf.org/html/rfc6902) to **MongoDB** update operations, which can be [written in bulk](https://www.mongodb.com/docs/manual/reference/method/db.collection.bulkWrite/) without querying and loading the target document into memory. This makes applying JSON Patch to a MongoDB document **faster** and **more memory-efficient**.

Supported JSON Patch operations: `add`, `remove`, `replace`, `copy` and `move`.

The functionality of the script has been tested using this [test set](https://github.com/json-patch/json-patch-tests) of operations.

## Usage

Copy `jsonPatchToMongoDbOps.ts` to your project and integrate the dependencies listed in `package.json`.
