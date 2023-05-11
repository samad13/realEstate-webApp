const mongoose = require("mongoose");
//const Joi = require('joi');
const bcrypt = require ("bcryptjs");


const userSchema =  new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    profileImg: {
      type: String,
      default: "/uploads/user/user.png",
    },
    password: {
      type: String,
      required: true,
      lowercase: true
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;

// Define the Joi schema
// const validateUserSchema = Joi.object({
//   name: Joi.string().min(3).required(),
//   email: Joi.string().email().required(),
//   profileImg: Joi.string().default('/uploads/user/user.png'),
//   password: Joi.string().min(6).required(),
//   isAdmin: Joi.boolean().default(false),
// });



