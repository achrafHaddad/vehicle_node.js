const express = require("express");
const cors = require("cors");
const createError = require("http-errors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());
const http = require("http").createServer(app);

const user = require("./routes/user.route");
const vehicle = require("./routes/vehicle.route");

app.use("/api/users", user);
app.use("/api/vehicles", vehicle);
app.use("/uploads", express.static(path.join("uploads")));

// handle errors --->
app.use(async (_, __, next) => {
	next(createError.NotFound("path does not exist"));
});

app.use((err, _, res, __) => {
	res.status(err.status || 500);
	res.send({
		error: {
			status: err.status || 500,
			message: err.message,
		},
	});
});
// <----

module.exports = http;
