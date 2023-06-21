const asyncHandler = require('express-async-handler');
const crypto = require('crypto')
const multer = require('multer');
const sharp = require('sharp')
const bcrypt = require('bcryptjs');
const User = require('../Models/userModels');
const generateToken = require('../utils/generateToken')
const sendEmail = require('../utils/email')


// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) =>{
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb)=>{
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file, cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null, true)
  }else{
    cb(new Error('not an image, pls upload only image',400), false)
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter

});

const uploadUserPhoto =  upload.single('profileImg')
const resizeUserPhoto =  async ( req, res, next)=>{
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
   await sharp(req.file.buffer)
  .resize(500, 500)
  .toFormat('jpeg')
  .jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`);

  next()

}

//@desc   get all users list  
//@route  GET /api/users
//@access private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

//@desc   Register new user
//@route  POST /api/users
//@access Public
const addNewUser = asyncHandler(async (req, res) => {

  // const { error } = validateUserSchema.validate(req.body); 
  // if (error) return res.status(400).send(error.details[0].message);

  let { name, email, password, passwordConfirm } = req.body;

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImg: user.profileImg,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});



// @desc     Auth the user & get token
// @route    GET /api/users/login
// @access   Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        profileImg: user.profileImg,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid username or password");
    }
  });




 // @desc     get user profile
// @route    GET /api/users/profile
// @access   Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImg: user.profileImg,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc     Update user profile
// @route    PUT /api/users/profile
// @access   Private

  const updateUserProfile = asyncHandler(async (req, res) =>{
  const user = await User.findByIdAndUpdate(req.user._id,
    { 
      name: req.body.name,
      email: req.body.email,
     profileImg : req.file.filename
            
    // profileImg: req.file.filename
    }, { new: true,
        runValidators: true });
       if (!user) {
        res.status(404)
        throw new Error("User not found");
      }      
  res.json({
    _id:user._id,
    name: user.name,
    email: user.email,
    profileImg: user.profileImg,
    isAdmin: user.isAdmin
  
  });
  
});

  // const updateUserProfile = asyncHandler(async (req, res) => {
  // //   const { error } = validateUserSchema.validate(req.body); 
  // // if (error) return res.status(400).send(error.details[0].message);
  // const filteredBody = filterObj(req.body, 'name', 'email','profileImg')
  //   const user = await User.findByIdAndUpdate(req.user._id, filteredBody,{
    
  //     name //= req.body.name || user.name;
  //     email// = req.body.email || user.email;
      
  //     // if (req.file) {
  //     //   user.profileImg = req.file.filename;
  //     }, 
  //     { new: true });

  //     res.status(404);
  //     throw new Error("User not found");
  //   }
  // });


  // @desc     Update user password
// @route    PUT /api/users/profile/password
// @access   Private
const updatePassword = asyncHandler(async(req, res)=>{
  const user = await User.findById(req.user._id).select('+password');
  if(!(await user.matchPassword(req.body.currentPassword, user.password))){
    res.status(404);
    throw new Error("Your current Password is wrong");
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  const updateUserPassword = await user.save();
  res.json({
    _id:updateUserPassword._id,
    name: updateUserPassword.name,
    email: updateUserPassword.email,
    isAdmin: updateUserPassword.isAdmin,
    token: generateToken(user._id),
  });

})

  // @desc     get user by Admin
// @route    GET /api/users/:id
// @access   Private/admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

  // @desc     Update user
// @route    PUT /api/users/:id
// @access   Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  // const { error } = validateUserSchema.validate(req.body); 
  // if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin;

    const updateUser = await user.save();

    res.json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      isAdmin: updateUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});


// @desc     Delete a user
// @route    DELETE /api/users/profile:id
// @access   Private
const deleteProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  //const user = await User.findById(req.user._id);
  if (user) {
    if (!user._id.equals(req.user._id)) {
      res.status(401);
      throw new Error("You are not authorized to delete this profile");
    }
    await user.deleteOne();
    res.json({ message: "your account as been deleted" });
  } else {
    res.status(404);
    throw new Error("no account with this inforation");
  }
});


// @desc     Delete a user
// @route    DELETE /api/users/:id
// @access   Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    req.status(404);// check
    throw new Error("User not found");
  }
});



const forgetPassword = asyncHandler(async(req, res) =>{
  //get user based on pasted email
  const user = await User.findOne({email: req.body.email})
  if(!user)
  {
    res.status(404);
    throw new Error("There is no user with email address",);
  }

  //generate random reset password
  const resetToken = user.createPasswordResetToken()
  await user.save({validateBeforeSave:false});

  //set it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forget your password? submit a patch request with your new password and passwordConfirm to: ${resetURL}.\nIf you didnt forget your password, please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token(valid for 10 minutes)",
      message
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email!"
    })
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetexpires = undefined
    await user.save({validateBeforeSave:false});
    console.log('Error sending email:', error.message);
    res.status(500);
    throw new Error("There was an error sending the email. Try again later!",);

  }
  
} )
const resetPassword = asyncHandler(async (req, res) =>{
  //get user based on token
const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

const user = await User.findOne({passwordResetToken: hashedToken,
  passwordResetexpires: {$gt: Date.now()}})
  // if token has not expired, and there is user, set the new password
if(!user){
  res.status(400);
    throw new Error('token is invalid or as expired')
}
user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm;
passwordResetToken = undefined;
passwordResetexpires = undefined;

await user.save()

  //update changedPasswordAt property for the user

  //log the user in, send JWT
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    profileImg: user.profileImg,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
})

})


module.exports ={
    addNewUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    uploadUserPhoto,
    resizeUserPhoto,
    forgetPassword,
    resetPassword,
    deleteProfile,
    updatePassword
}