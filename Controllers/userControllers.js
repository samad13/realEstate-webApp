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
const getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

//@desc   Register new user
//@route  POST /api/users
//@access Public
const addNewUser = async (req, res) => {

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
};



// @desc     Auth the user & get token
// @route    GET /api/users/login
// @access   Public
const authUser = async (req, res) => {
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
  };




 // @desc     get user profile
// @route    GET /api/users/profile
// @access   Private
const getUserProfile = async (req, res) => {
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
};

// @desc     Update user profile
// @route    PUT /api/users/profile
// @access   Private
  const updateUserProfile = async (req, res) => {
  //   const { error } = validateUserSchema.validate(req.body); 
  // if (error) return res.status(400).send(error.details[0].message);
  
    const user = await User.findById(req.user._id);
  
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.file) {
        user.profileImg = req.file.filename;
      }
      if (req.body.currentPassword && req.body.newPassword) {
        const match = await bcrypt.compare(
          req.body.currentPassword,
          user.password
        );
        if (match) {
          user.password = req.body.newPassword;
        } else {
          res.status(401);
          throw new Error("Password do not match");
        };
        
      };
     // passwordConfirm: req.body.passwordConfirm
  
      const updateUser = await user.save();
  
      res.json({
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        isAdmin: updateUser.isAdmin,
      });
      //not sure if we shd pass token
      // token: generateToken(user._id),
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  };



  // @desc     get user by Admin
// @route    GET /api/users/:id
// @access   Private/admin
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
  } else {
    req.status(404);
    throw new Error("User not found");
  }
};

  // @desc     Update user
// @route    PUT /api/users/:id
// @access   Private/Admin
const updateUser = async (req, res) => {
  const { error } = validateUserSchema.validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

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
};


// @desc     Delete a user
// @route    DELETE /api/users/:id
// @access   Private/Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    req.status(404);// check
    throw new Error("User not found");
  }
};



const forgetPassword = async(req, res) =>{
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
  
} 
const resetPassword = async (req, res) =>{
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

}


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
    resetPassword
}