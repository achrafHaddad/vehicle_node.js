const jwt = require("jsonwebtoken");
const createError = require("http-errors");

exports.signAccessToken = async (userId, role) => {
	const payload = { id: userId, role };
	const secret = process.env.TOKEN_SECRET;
	const options = {
		expiresIn: "1d"
	};
	try {
		const token = await jwt.sign(payload, secret, options);

		return token;
	} catch (error) {
		throw createError.InternalServerError();
	}
};

exports.authMiddleWare = async (req, _, next) => {
	try {
		const authHeader = req.headers["authorization"];
		if (!authHeader) return createError.Unauthorized();

		const token = authHeader.split(" ")[1];
		if (token === undefined) return createError.Unauthorized();

		const verifToken = await jwt.verify(token, process.env.TOKEN_SECRET);
		req.user = verifToken;

		next();
	} catch (error) {
		const message = error.name === "JsonWebTokenError" ? "Unauthorizedd" : error.message;
		return next(createError.Unauthorized(message));
	}
};
