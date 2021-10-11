require("dotenv").config();
const http = require("./app");
const bcrypt = require("bcrypt");

require("./config/mongo-init");
const { mailNotif } = require("./middleware/cron");

const User = require("./models/userSchema");

const createAdmin = async () => {
	try {
		const adminEmail = "admin@test.com";
		const password = "12345678";

		const adminExist = await User.findOne({ email: adminEmail });
		if (adminExist) return;

		const admin = new User({
			firstName: "admin",
			lastName: "admin",
			email: adminEmail,
			role: "admin",
		});

		const salt = await bcrypt.genSalt(10);
		const hashPassword = await bcrypt.hash(password, salt);
		admin.password = hashPassword;

		await admin.save();
	} catch (error) {
		console.log(error);
	}
};

createAdmin();

mailNotif.start();

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => console.log(`listening on port ${PORT}`));
