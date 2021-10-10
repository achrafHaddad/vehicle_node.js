const User = require("../models/userSchema");
const CronJob = require("cron").CronJob;
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

const mailNotif = new CronJob(
	"0 17 * * *",
	async () => {
		const usersToNotify = await User.aggregate([
			{
				$project: {
					duration: {
						$floor: {
							$divide: [
								{
									$subtract: [new Date(), "$lastConnected"],
								},
								24 * 60 * 60 * 1000,
							],
						},
					},
					date: "$lastConnected",
					send: "$send",
					email: "$email",
				},
			},
			{
				$match: {
					duration: {
						$exists: true,
						$ne: null,
						$gte: 14,
					},
					send: {
						$ne: true,
					},
				},
			},
		]);

		if (usersToNotify.length) {
			for (const user of usersToNotify) {
				const mailOptions = {
					to: user.email,
					from: AUTH_USERNAME,
					subject: `Absence notification-${user._id.toString().slice(0, 7)}`,
					text: "You are receiving this email because du to your abcense from the application from more than 14 days",
				};

				await transporter.sendMail(mailOptions, async (error, info) => {
					if (error) {
						console.log("Error occurred");
						console.log(error.message);
						return createError.InternalServerError(error.message);
					}
					console.log("send");
					await User.findByIdAndUpdate(user._id, { send: true });
				});
			}
		}
	},
	null,
	true,
	"Africa/Tunis",
);

module.exports = { mailNotif };
