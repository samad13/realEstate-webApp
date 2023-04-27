const Property = require("../Models/propertyModel")

//@desc   get all homes list
//@route  GET /api/homes
//@access Public
const getAllPoperties = async (req, res) => {
    const AllPoperties = await Property.find({});
    if (!AllPoperties) {
        return res.status(404).json({ error: 'properties not found' });
      }
    res.json(AllPoperties)
  };
  

  //@desc   get all homes list by user
  //@route  GET /api/homes
  //@access Private
  
  const getUserProperty = async (req, res) => {
    const myProperty = await Property.find({posted_by:req.user._id});
    if (!myProperty) {
      res.status(404);
      throw new Error("Property Not Found");
    }
    if (myProperty.length === 0) {
      return res.status(404).json('You didn\'t post any properties');
    }
    res.json(myProperty);
  };
  
  

// @desc    Create a product
// @route   POST /api/products
// @access  Private/user
const createdProperty = async (req, res) => {
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
  }

  // @desc    Update a property
// @route   PUT /api/property:id
// @access  Private/Admin
const updateProperty = async (req, res) => {
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
};


// @desc    DELETE a home and images linked to home
// @route   DELETE /api/homes/:id
// @access  Private/and also admin
const deleteProperty = async (req, res) => {
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
};







  module.exports = {
    createdProperty,
    getAllPoperties,
    getUserProperty,
    updateProperty,
    deleteProperty
    
  }

  