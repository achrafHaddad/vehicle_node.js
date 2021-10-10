const mongoose = require("mongoose");

const MONGO_DATABASE = "project";
const { MONGO_PORT } = process.env;

const MOGO_URI = `mongodb://localhost:${MONGO_PORT}/`;

mongoose
	.connect(MOGO_URI + MONGO_DATABASE, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("connected to database"))
	.catch(err => console.log(err));

module.exports = { MOGO_URI, MONGO_DATABASE };
