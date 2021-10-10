const express = require("express");
const {
	createVehicle,
	getUserVehicles,
	getUserVehicle,
	editUserVehicle,
	deleteUserVehicle,
} = require("../controllers/vehicle.controller");
const { authMiddleWare } = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleWare, createVehicle);
router.get("/", authMiddleWare, getUserVehicles);
router.get("/:vehicleId", authMiddleWare, getUserVehicle);
router.put("/:vehicleId", authMiddleWare, editUserVehicle);
router.delete("/:vehicleId", authMiddleWare, deleteUserVehicle);

module.exports = router;
