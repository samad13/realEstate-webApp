const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require("dotenv");


const propertyRoutes = require('./Routes/propertyRoutes');
const userRoutes = require('./Routes/userRoutes');

dotenv.config()
const app = express();
app.use(morgan('dev'))






// Database
mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('database connected!');
  })
  .catch((err) => {
    console.log(err);
  });

  

//middleware

app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use('/api/property', propertyRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running on port ${PORT}`
  )
);