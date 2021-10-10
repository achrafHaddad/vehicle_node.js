const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			trim: true,
			lowercase: true,
			unique: true,
			required: true,
		},
		password: String,
		firstName: String,
		lastName: String,
		avatar: String,
		phone: String,
		address: String,
		lastConnected: { type: Date, default: Date.now() },
		send: { type: Boolean, default: false },
		accountStatus: { type: String, enum: ["Active", "Banned"], default: "Active" },
		role: { type: String, enum: ["user", "admin"], default: "user" },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
