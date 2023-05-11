
const router = require('express').Router();


const {createdProperty, getAllProperties, getUserProperty, updateProperty, deleteProperty } = require('../Controllers/propertycontrollers')
const { protect } = require ("../middlware/authMiddleware");


router.route("/").get(getAllProperties).post(protect,createdProperty);
router.route("/user").get(protect, getUserProperty);
router
  .route("/:id")
  .put(protect,  updateProperty)
  .delete(protect, deleteProperty);
 
 
module.exports = router

