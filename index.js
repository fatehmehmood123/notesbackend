require('dotenv').config();
const cors = require("cors");
const express = require('express')
const mongoose = require('mongoose')
const Book = require("./models/books");
const User = require("./models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

const app = express()
const PORT = process.env.PORT || 3000
app.use(cors());
mongoose.set('strictQuery', false);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
app.use(express.json());
//Routes go here
app.get('/', (req,res) => {
    res.send({ title: 'Books' });
})

app.get('/books', async (req,res)=> {

  const book = await Book.find();

  if (book) {
    res.json(book)
  } else {
    res.send("Something went wrong.");
  }
  
});
app.get('/books/:id', async (req,res)=> {
  const book = await Book.findById(req.params.id);
  if (book) {
    res.json(book)
  } else {
    res.send("Something went wrong.");
  }
});

app.post('/add', async (req, res) => {
  try {
    const newBook = new Book({
      title: req.body.title,
      body: req.body.body
    });

    await newBook.save();
    res.json({ message: 'Book added successfully' });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.delete('/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    // Delete the book with the specified ID using your MongoDB driver or ORM
    // Replace the following code with your actual deletion logic
    await Book.findByIdAndDelete(bookId);

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'An error occurred while deleting the book' });
  }
});
app.post("/register", async (req, res) => {
  const newUser = new User({
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString()
  });
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(401).json("Wrong credentials!");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    OriginalPassword !== req.body.password &&
      res.status(401).json("Wrong credentials!");

      const accessToken = jwt.sign(
        {
          id: user._id
        },
        process.env.JWT_SEC,
        {expiresIn:"3d"}
      );
  
      const { password, ...others } = user._doc;
  
      res.status(200).json({...others, accessToken});
  } catch (err) {
    res.status(500).json(err);
  }
});
//Connect to the database before listening
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})