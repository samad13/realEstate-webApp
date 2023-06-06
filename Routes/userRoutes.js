const  express = require ("express");

const  {
  getAllUsers,
  addNewUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getUserById,
  updateUser,
  uploadUserPhoto,
  resizeUserPhoto,
  forgetPassword,
  resetPassword,
  deleteProfile,
  updatePassword
} = require("../Controllers/userControllers");
const { protect, admin } = require ("../middlware/authMiddleware");



const router = express.Router();

router.route("/").post(addNewUser).get(protect,admin, getAllUsers);
router.post("/login", authUser);
router.post("/forgetPassword", forgetPassword);
router.patch("/resetPassword/:token", resetPassword);
router
  .route("/profile")
  .get(protect, getUserProfile).put(protect, uploadUserPhoto,resizeUserPhoto, updateUserProfile)
  router.delete("/profile/:id", protect, deleteProfile)
  router.put("/updatepassword",protect, updatePassword );
 router
   .route("/:id")
   .get(protect, admin, getUserById)
   .delete(protect, admin, deleteUser)
   .put(protect, admin, updateUser);

module.exports = router;
