const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
	{
		name: String,
		model: String,
		licensePlate: String,
		status: { type: String, enum: ["Active", "Deleted"], default: "Active" },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
