const mongoose = require('mongoose');
//const Joi = require('joi');

const propertySchema = mongoose.Schema(
    {

    description: {type: String, required: true},
    property_type: { type: String, enum : ['residential','commercial','industrial' ],
     required: [true, "type of property needs to be specify!"], lowercase: true},
        address: { type: String, required: [true, "Must provide your address!"], },
        city: { type: String, required: [true, "Must provide your city!"], },
        state: { type: String, required: [true, "Must provide your state!"], },
        country: { type: String, required: [true, "Must provide your country!"], },
      images:{ type: [String], required:[true, "images needs to be uploaded!"], },
      price: { type: Number, required: [true, "Must provide your price!"], },
       date:{ Date },
      rooms: { type: Number, required: [true, "Must provide your number of room!"],},
      bathrooms:{ type: Number, required: [true, "Must provide your bathrom!"], },
      posted_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    },
    {
      timestamps: true,
    }
  );
  
  const Property = mongoose.model("Property", propertySchema);

  // const validatePropertySchema = Joi.object({
  //   description: Joi.string().required(),
  //   property_type: Joi.string().valid('residential', 'commercial', 'industrial').required(),
  //   address: Joi.string().required(),
  //   city: Joi.string().required(),
  //   state: Joi.string().required(),
  //   country: Joi.string().required(),
  //   images: Joi.string().required(),
  //   price: Joi.number().required(),
  //   date: Joi.date(),
  //   rooms: Joi.number().required(),
  //   bathrooms: Joi.number().required(),
  //   posted_by: Joi.string().required(),
  // });
  
  
   module.exports = Property
    //validatePropertySchema
   ;