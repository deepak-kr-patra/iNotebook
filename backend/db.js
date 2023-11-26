const mongoose = require('mongoose');

const mongoUri = "mongodb://0.0.0.0:27017/inotebook"

const connectToMongo = () => {
    main().catch(err => console.log(err));
    console.log("Hello");
}

async function main() {
  await mongoose.connect(mongoUri);
  console.log("connected to database");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

module.exports = connectToMongo;