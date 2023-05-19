
const router = require('express').Router();


const {createdProperty,
   getAllProperties, 
   getUserProperty,
    updateProperty,
    deleteProperty,
    uploadPropertyImage,
  resizePropertyImage } = require('../Controllers/propertycontrollers')
const { protect } = require ("../middlware/authMiddleware");


router.route("/").get(getAllProperties).post(protect,uploadPropertyImage, resizePropertyImage, createdProperty);
router.route("/user").get(protect, getUserProperty);
router
  .route("/:id")
  .put(protect, uploadPropertyImage, resizePropertyImage,  updateProperty)
  .delete(protect, deleteProperty);
 
 
module.exports = router

