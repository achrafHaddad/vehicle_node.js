const Vehicle = require("../models/vehicleSchema");
const User = require("../models/userSchema");
const createError = require("http-errors");

exports.createVehicle = async (req, res, next) => {
	const { name, model, licensePlate } = req.body;
	const id = req.query.id || req.user.id;

	try {
		const vehicle = new Vehicle({ name, model, licensePlate, userId: id });
		await vehicle.save();

		res.status(201).send({ message: "vehicle created", vehicle });
	} catch (error) {
		next(error);
	}
};

exports.getUserVehicles = async (req, res, next) => {
	try {
		let id = req.user.id;
		let query = { userId: id, status: "Active" };

		if (req.query.id) {
			const admin = await User.findById(req.user.id);
			if (admin.role !== "admin") return next(createError.Unauthorized());
			id = req.query.id;
			query = { userId: id };
		}

		const vehicles = await Vehicle.find(query);

		res.status(200).send(vehicles);
	} catch (error) {
		next(error);
	}
};

exports.getUserVehicle = async (req, res, next) => {
	const { licensePlate } = req.params;

	try {
		const vehicle = await Vehicle.findOne({ userId: req.user.id, licensePlate, status: "Active" });
		if (!vehicle) return next(createError.NotFound("vehicle does not exist"));

		res.status(200).send(vehicles);
	} catch (error) {
		next(error);
	}
};

exports.editUserVehicle = async (req, res, next) => {
	const { name, model, licensePlate } = req.body;
	const { vehicleId } = req.params;

	try {
		const id = req.query.id || req.user.id;
		const vehicle = await Vehicle.findOneAndUpdate({ _id: vehicleId, userId: id }, { name, model, licensePlate }, { new: true });

		res.status(200).send({ message: "vehicle updated", vehicle });
	} catch (error) {
		next(error);
	}
};

exports.deleteUserVehicle = async (req, res, next) => {
	const { vehicleId } = req.params;

	try {
		let id = req.user.id;
		let status = "Deleted";
		let adminRole = false;

		if (req.query.id) {
			const admin = await User.findById(req.user.id);
			if (admin.role !== "admin") return next(createError.Unauthorized());
			id = req.query.id;
			adminRole = true;
		}

		const exist = await Vehicle.findOne({ _id: vehicleId, userId: id });
		if (!exist) return next(createError.NotFound("vehicle does not exist"));

		if (adminRole) status = exist.status === "Active" ? "Deleted" : "Active";

		const vehicle = await Vehicle.findOneAndUpdate({ _id: vehicleId, userId: id }, { status }, { new: true });

		res.status(200).send({ message: "vehicle deleted", vehicle });
	} catch (error) {
		next(error);
	}
};
