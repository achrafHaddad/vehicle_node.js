const express = require("express");
const {
	register,
	login,
	banUser,
	getUsers,
	getProfile,
	updateProfile,
	createProfile,
} = require("../controllers/user.controller");
const { authMiddleWare } = require("../middleware/auth");
const { imgUpload, multerError } = require("../config/multer");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.delete("/ban-user/:userToBanId", authMiddleWare, banUser);
router.get("/", authMiddleWare, getUsers);
router.get("/profile", authMiddleWare, getProfile);
router.put("/", authMiddleWare, imgUpload.single("avatar"), updateProfile, multerError);
router.post("/", authMiddleWare, imgUpload.single("avatar"), createProfile, multerError);

module.exports = router;
