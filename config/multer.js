const multer = require("multer");

const mime_map = {
	"image/png": "png",
	"image/jpg": "jpg",
	"image/jpeg": "jpg",
};
const maxSize = 1 * 1024 * 1024; // for 1MB

const imgStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads");
	},
	filename: function (req, file, cb) {
		const name = file.originalname.toLowerCase().split(".")[0];
		const ext = mime_map[file.mimetype];
		cb(null, name + "-" + Date.now() + "." + ext);
	},
});

exports.multerError = (err, req, res, next) => {
	res.status(400).send({ message: err.message });
};

exports.imgUpload = multer({
	storage: imgStorage,
	limits: { fileSize: maxSize },
});
