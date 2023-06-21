/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - passwordConfirm
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         profileImg:
 *           type: string
 *           description: Profile image URL
 *         password:
 *           type: string
 *           description: Insert password
 *         passwordConfirm:
 *           type: string
 *           description: Confirm the inserted password
 */

//issue is in above do it later
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The new user details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 */


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
