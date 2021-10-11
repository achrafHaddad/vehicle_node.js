const nodemailer = require("nodemailer");
const createError = require("http-errors");

const { AUTH_USERNAME, AUTH_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: AUTH_USERNAME,
		pass: AUTH_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

const newAccountEmail = async (email, password) => {
	const mailOptions = {
		to: email,
		from: AUTH_USERNAME,
		subject: `New Accout`,
		text: `
            Welcome to Vehicles_Management, your account credentials are:
            - email:${email}
            - password:${password}`,
	};

	await transporter.sendMail(mailOptions, async (error, info) => {
		if (error) {
			console.log("Error occurred");
			console.log(error.message);
			return createError.InternalServerError(error.message);
		}
		console.log("send");
	});
};

module.exports = { transporter, newAccountEmail };
