
/**
 * @swagger
 * /api/property:
 *  get:
 *    description: Use to request all property
 *    responses:
 *      '200':
 *        description: A successful response
 */

/**
 * @swagger
 * /api/property/:
 *  post:
 *    description: Use to create property
 *    responses:
 *      '200':
 *        description: A successful response
 */
 


const router = require('express').Router();

// id:
// type: integer
// name:

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

