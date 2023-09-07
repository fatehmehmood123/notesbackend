require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Note = require("./models/Note");
const User = require("./models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { verifyTokenAndAuthorization } = require("./routes/verifyToken");
const app = express();
const PORT = process.env.PORT || 3400;
const cors = require("cors");
app.use(cors());
mongoose.set("strictQuery", false);
app.use(express.json());

app.use(function (req, res, next) {
  const allowedOrigins = [
    "https://notes-on-cloud.vercel.app",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5500/frontend/signup.html",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(
  cors({
    origin: "*",
  })
);
// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

//Routes go here

// Adding a new Note
app.post("/add/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const newNote = new Note({
      userId: req.user.id,
      title: req.body.title,
      body: req.body.body,
    });

    await newNote.save();
    res.json({ message: "Note added successfully" });
  } catch (error) {
    console.error("Error adding Note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.json({
    name: "Muhammad Fateh Mehmood",
    Application: "Note on Cloud",
    DeployedOn: "Vercel",
    FrontEndLink: "https://notes-on-cloud.vercel.app/",
  });
});
// Getting the Notes of User
app.get("/notes/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const userId = req.params.id; // Assuming you have the user ID available in the request object
    const notes = await Note.find({ userId: userId });

    res.json(notes);
  } catch (error) {
    console.error("Error retrieving notes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Editing the Notes of User
app.get("/edit/:id/:noteId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const id = req.params.noteId;
    const notes = await Note.find({ _id: id });

    res.json(notes);
  } catch (error) {
    console.error("Error retrieving notes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete Note
app.delete(
  "/note/:id/:noteId",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const noteId = req.params.noteId;

      // Delete the Note with the specified ID using your MongoDB driver or ORM
      // Replace the following code with your actual deletion logic
      await Note.findByIdAndDelete(noteId);

      res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting note:", error);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the Note" });
    }
  }
);

// Register a User
app.post("/register", async (req, res) => {
  const newUser = new User({
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
    token: req.body.token,
    isVerified: req.body.isVerified,
  });
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Login a User
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user &&
      res.status(401).json("The Account with this email does not exist!");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    OriginalPassword !== req.body.password &&
      res.status(401).json("Wrong Password!");

    user.isVerified === false && res.status(401).json("Email not verified");
    const accessToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(500).json(err);
  }
});
// Update Email of User
app.put("/user/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});
// verify email route
app.post("/sendVerificationEmail", async (req, res) => {
  const email = req.body.email;
  const token = req.body.verificationToken;
  console.log(token);

  // Create a link that the user can click to verify their email
  const verificationLink = `https://notesbackend-ten.vercel.app/verify-email?token=${token}`;

  // Send the verification email
  const transporter = nodemailer.createTransport({
    // Configure your email service provider here (e.g., Gmail, SendGrid)
    service: "Gmail",
    auth: {
      user: "fatehmehmood123@gmail.com",
      pass: "zpwrsydgqikzkaqs",
    },
  });

  const mailOptions = {
    from: "fatehmehmood123@gmail.com",
    to: email,
    subject: "Email Verification",
    text: `Click on the following link to verify your email: ${verificationLink}`,
  };
  // ${verificationLink}
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ error: "Internal server error" });
    } else {
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Email sent successfully" });
    }
  });
});
app.get("/verify-email", async (req, res) => {
  const token = parseInt(req.query.token);
  console.log(token);
  // Find the user with the provided verification token
  const user = await User.findOne({ token: token });
  console.log(user);
  if (!user) {
    return res.status(404).json({ error: "Verification token not found" });
  }

  // Verify the user's email
  user.isVerified = true;
  // user.token = undefined; // Remove the token after verification
  await user.save();

  res.status(200).json({ message: "Email verified successfully" });
});
app.get("/check", async (req, res) => {
  const user = await User.findOne({ token: 318482 });
  console.log(user);
  if (!user) {
    return res.status(404).json({ error: "Verification token not found" });
  }
  if (user) {
    return res.status(200).json(user);
  }
});
//Connect to the database before listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("listening for requests");
  });
});
