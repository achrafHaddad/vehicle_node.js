const User = require("../models/userSchema");
const createError = require("http-errors");
const fs = require("fs").promises;
const bcrypt = require("bcrypt");
const { signAccessToken } = require("../middleware/auth");
const { newAccountEmail } = require("../middleware/mailer");

exports.register = async (req, res, next) => {
	try {
		const { email, password, firstName, lastName } = req.body;
		const exist = await User.findOne({ email });
		if (exist) return next(createError.Conflict("account already exist"));

		const salt = await bcrypt.genSalt(10);
		const hashPassword = await bcrypt.hash(password, salt);

		const user = new User({ email, password: hashPassword, firstName, lastName });
		await user.save();

		const token = await signAccessToken(user._id, user.role);

		res.status(201).send({ message: "account created", token });
	} catch (error) {
		next(error);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (!user) return next(createError.Unauthorized("invalid email or password"));
		if (user.accountStatus === "Banned") return next(createError.Unauthorized("user account is Banned"));

		const validPass = await bcrypt.compare(password, user.password);
		if (!validPass) return next(createError.Unauthorized("invalid email or password"));

		const token = await signAccessToken(user._id, user.role);
		await User.findByIdAndUpdate(user._id, { lastConnected: Date.now(), send: false });

		res.status(200).send({ message: "welcome", token });
	} catch (error) {
		next(error);
	}
};

exports.banUser = async (req, res, next) => {
	try {
		const admin = await User.findById(req.user.id);
		if (admin.role !== "admin") return next(createError.Unauthorized());

		const { userToBanId } = req.params;

		if (admin._id == userToBanId) return next(createError.Conflict("you should not ban yourself"));

		const user = await User.findById(userToBanId);
		const status = user.accountStatus === "Active" ? "Banned" : "Active";
		await User.findByIdAndUpdate(userToBanId, { $set: { accountStatus: status } });

		res.status(204).send({ message: "accounts banned" });
	} catch (error) {
		next(error);
	}
};

exports.getUsers = async (req, res, next) => {
	try {
		const admin = await User.findById(req.user.id);
		if (admin.role !== "admin") return next(createError.Unauthorized());

		const users = await User.find();

		res.status(200).send(users);
	} catch (error) {
		next(error);
	}
};

exports.getProfile = async (req, res, next) => {
	try {
		const id = req.query.id || req.user.id;
		const user = await User.findById(id, { password: 0 });

		if (!user) return next(createError.NotFound());

		res.status(200).send(user);
	} catch (error) {
		next(error);
	}
};

exports.updateProfile = async (req, res, next) => {
	try {
		const id = req.query.id || req.user.id;
		const { email, firstName, lastName, phone, address, role } = req.body;

		const updatedUser = await User.findById(id);

		let imagePath;

		if (req.file) {
			const url = req.protocol + "://" + req.get("host");
			imagePath = updatedUser.avatar ? "./uploads" + updatedUser.avatar.split("uploads")[1] : undefined;
			updatedUser.avatar = url + "/uploads/" + req.file.filename;
		}

		updatedUser.email = email;
		updatedUser.firstName = firstName;
		updatedUser.lastName = lastName;
		updatedUser.phone = phone;
		updatedUser.address = address;
		updatedUser.role = role;

		await updatedUser.save();

		if (imagePath) await fs.unlink(imagePath);

		res.status(200).send({ message: "user updated", updatedUser });
	} catch (error) {
		next(error);
	}
};

exports.createProfile = async (req, res, next) => {
	try {
		const admin = await User.findById(req.user.id);
		if (admin.role !== "admin") return next(createError.Unauthorized());

		let password = "";
		const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (let i = 0; i < 8; i++) {
			password += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		const salt = await bcrypt.genSalt(10);
		const hashPassword = await bcrypt.hash(password, salt);

		const { email, firstName, lastName, phone, address, role } = req.body;

		const user = new User({
			email,
			password: hashPassword,
			firstName,
			lastName,
			phone,
			address,
			role,
		});

		if (req.file) {
			const url = req.protocol + "://" + req.get("host");
			updatedUser.avatar = url + "/uploads/" + req.file.filename;
		}

		await user.save();
		await newAccountEmail(user.email, password);

		res.status(201).send({ message: "user created", user });
	} catch (error) {
		next(error);
	}
};
