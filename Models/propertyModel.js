const mongoose = require('mongoose');

const propertySchema = mongoose.Schema(
    {

    description: {type: String, required: true},
    property_type: { type: String, enum : ['residential','commercial', ],
     required: [true, "type of property needs to be specify!"], lowercase: true},
        address: { type: String, required: [true, "Must provide your address!"], },
        city: { type: String, required: [true, "Must provide your city!"], },
        state: { type: String, required: [true, "Must provide your state!"], },
        country: { type: String, required: [true, "Must provide your country!"], },

      images:{ type: String, required:[true, "images needs to be uploaded!"], },
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
   module.exports = Property;