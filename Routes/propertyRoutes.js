//const router = express.Router();
const router = require('express').Router();


const {createdProperty, getAllPoperties, getUserProperty, updateProperty, deleteProperty } = require('../Controllers/propertycontrollers')
const { protect , admin} = require ("../middlware/authMiddleware");


router.route("/").get(getAllPoperties).post(protect,createdProperty);
router.route("/user").get(protect, getUserProperty);
router
  .route("/:id")
  .put(protect,  updateProperty)
  .delete(protect, deleteProperty);
 
 
module.exports = router

