const User = require("../models/userSchema");
const CronJob = require("cron").CronJob;
const createError = require("http-errors");
const { transporter } = require("./mailer");

const { AUTH_USERNAME } = process.env;

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

// const backup = new CronJob(
// 	"* * * * *",
// 	() => {
// 		const { spawn } = require("child_process");
// 		const path = require("path");
// 		const { MOGO_URI, MONGO_DATABASE } = require("../config/mongo-init");
// 		const date = Date.now();

// 		const ARCHIVE_PATH = `./${MONGO_DATABASE}`;
// 		// console.log(ARCHIVE_PATH);

// 		const spawnedShell = spawn("/bin/sh");
// 		// Capture stdout
// 		spawnedShell.stdout.on("data", d => console.log(d.toString()));
// 		// Write some input to it
// 		// spawnedShell.stdin.write("docker exec -it backend-node_mongo_1 bash\n");
// 		console.log("mongo");
// 		// We can add more commands, but make sure to terminate
// 		spawnedShell.stdin.write(`mongodump --db=project --out=./ --gzip\n`);
// 		// spawnedShell.stdin.write(`exit\n`);
// 		// spawnedShell.stdin.write(`docker cp backend-node_mongo_1:${ARCHIVE_PATH} ./db_backups \n`);
// 		console.log("dump");
// 		// End
// 		spawnedShell.stdin.end();
// 	},
// 	null,
// 	true,
// 	"Africa/Tunis",
// );

module.exports = { mailNotif };
