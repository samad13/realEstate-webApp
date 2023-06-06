const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const rateLimit =require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const { notFound, errorHandler } = require('./middlware/errorHandler')
const dotenv = require("dotenv");


const propertyRoutes = require('./Routes/propertyRoutes');
const userRoutes = require('./Routes/userRoutes');

dotenv.config()
const app = express();

//SET SECURITY HTTP HEADERS
app.use(helmet())



app.use(morgan('dev'))

//this is to prevent the same ip from making too many request to our API 
const limiter = rateLimit({
  max:100,
  windowMs: 60 * 60* 1000, 
  message: 'Too many request from this IP, please try again in an hour!'
})

app.use('/api',limiter);




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
//Data sanitization against noSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//prevent parameter polution
//app.use(hpp());

app.use(express.urlencoded({ extended: true }));
app.use('/api/property', propertyRoutes);
app.use("/api/users", userRoutes);


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running on port ${PORT}`
  )
);