crypto = require('crypto')
const mongoose = require("mongoose");
//const Joi = require('joi');
const validator = require('validator');
const bcrypt = require ("bcryptjs");



const userSchema =  new mongoose.Schema(
  {
    name: {
      type: String,
      required:  [true, "please provide your name"],
    },
    email: {
      type: String,
      required:  [true, "please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    profileImg: {
      type: String,
      default: "/uploads/user/user.png",
    },
    password: {
      type: String,
      required:  [true, "please provide password"],
    },
    passwordConfirm: {
      type: String,
      required: [true, "please confirm password"],
      validate:{
        validator: function(el) {
          return el === this.password;
        },
        message: "Passwords are not the same"

      }
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    passwordResetToken:String,
    passwordResetexpires:Date
  },
  
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

userSchema.pre("save", async function (next) {
  //only run if password was modified
  if (!this.isModified("password")) {
    next();
  }
  //hash the password with the cost of 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  //delete passwordConfirm field
  this.passwordConfirm = undefined;
  //next();
});

userSchema.methods.createPasswordResetToken =  function(){
  const resetToken = crypto.randomBytes(32).toString('hex');

 this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
 console.log({resetToken}, this.passwordResetToken)
 this.passwordResetexpires = Date.now() + 10 * 60 * 1000;

 return resetToken;
}

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



