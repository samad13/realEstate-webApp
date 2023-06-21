const asyncHandler = require('express-async-handler');
const multer = require('multer');
const sharp = require('sharp')
const Property  = require("../Models/propertyModel")



const multerStorage = multer.memoryStorage();

const multerFilter = (req,file, cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null, true)
  }else{
    cb(new Error('not an image, pls upload only image'), false)
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter

});

const uploadPropertyImage = upload.array('images', 3)

const resizePropertyImage =  async ( req, res, next)=>{
  if(!req.files) return next();

  req.body.images = []

  await Promise.all(req.files.map( async(file, i)=>{
   const filename = `property-${req.user.id}-${Date.now()}-${i + 1}.jpeg`;

     await sharp(file.buffer)
  .resize(2000, 1333)
  .toFormat('jpeg')
  .jpeg({quality:90}).toFile(`public/img/property/${filename}`);

  req.body.images.push(filename)
}))
  next()
 
}


//@desc   get all homes list
//@route  GET /api/property
//@access Public
const getAllProperties = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchQuery = req.query.search || '';

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    let query = Property.find();

    // Apply search query if provided
    if (searchQuery) {
      query = query.find({ property_type: { $regex: searchQuery, $options: 'i' } });
    }

    const totalProperties = await Property.countDocuments(query).exec();

    if (endIndex < totalProperties) {
      results.next = {
        page: page + 1,
        limit: limit
      };
    }

    if (startIndex !== 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      };
    }

    if (req.query.page && startIndex >= totalProperties) {
      throw new Error('This page does not exist');
    }

    results.results = await query.limit(limit).skip(startIndex).exec();
    res.json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});  


  //@desc   get all homes list by user
  //@route  GET /api/property/user
  //@access Private
  
  const getUserProperty = asyncHandler(async (req, res) => {
    const myProperty = await Property.find({posted_by:req.user._id});
    if (!myProperty) {
      res.status(404);
      throw new Error("Property Not Found");
    }
    if (myProperty.length === 0) {
      return res.status(404).json('You didn\'t post any properties');
    }
    res.json(myProperty);
  });
  
  

// @desc    Create a product
// @route   POST /api/products
// @access  Private/user
const createdProperty = asyncHandler(async (req, res) => {
  // const { error } = validatePropertySchema.validate(req.body); 
  // if (error) return res.status(400).send(error.details[0].message);
    const property = new Property({
    description: req.body.description,
    property_type: req.body.property_type,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      price: req.body.price,
      images: req.body.images,
      rooms: req.body.rooms,
      bathrooms: req.body.bathrooms,
      date: new Date(),
      posted_by:  req.user._id
    
    })
  
    const addProperty= await property.save()
    res.status(201).json(addProperty)
  });

  // @desc    Update a property
// @route   PUT /api/property:id
// @access  Private
const updateProperty = asyncHandler(async (req, res) => {
  // const { error } = validatePropertySchema.validate(req.body); 
  // if (error) return res.status(400).send(error.details[0].message);

  const { description, property_type, address, city, state, country, images, price, rooms, bathrooms } = req.body;
  const property = await Property.findById(req.params.id);

  if (property) {
    if (property.posted_by.equals(req.user._id)) {
    property.description = description;
    property.property_type = property_type;
    property.address = address;
    property.city = city;
    property.state = state;
    property.country = country;
    property.images = images;
    property.price = price;
    property.rooms = rooms;
    property.bathrooms = bathrooms;
    property.posted_by = req.user._id;

      const updatedProperty = await property.save();
      res.status(201).json( updatedProperty);
    } else {
      throw new Error("User Verification Failed");
    }
  } else {
    res.status(404);
    throw new Error("property Not Found");
  }
});


// @desc    DELETE a home and images linked to home
// @route   DELETE /api/homes/:id
// @access  Private/and also admin
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  // Check if user making the request is either the property owner or an admin
  if (!property.posted_by.equals(req.user._id) || !req.user.isAdmin) {
    throw new Error("User not authorized");
  }

  await property.deleteOne();
  res.status(200).json({ message: "Property deleted successfully" });
});






  module.exports = {
    createdProperty,
    getAllProperties,
    getUserProperty,
    updateProperty,
    deleteProperty,
    uploadPropertyImage,
    resizePropertyImage
    
  }

  