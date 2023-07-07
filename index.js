const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Connect to MongoDB
const DB_URI = "mongodb+srv://sonu788380:mxYmaBMWD8zpEB7X@cluster0.qtf3eb6.mongodb.net/Portfolio?retryWrites=true&w=majority"; // Replace with your MongoDB URI
mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Failed to connect to MongoDB:", error);
  });

// Define the User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const certificateSchema = new mongoose.Schema({
  image: String,
  certificateName: String,
  certificateDetails: String,
});

const projectSchema = new mongoose.Schema({
  projectName: String,
  projectDetails: String,
  projectImage: String,
  projectLink: String,
});

const User = mongoose.model("User", userSchema);
const Certificate = mongoose.model("Certificate", certificateSchema);
const Project = mongoose.model("Project", projectSchema);

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Configure multer storage
const storage = multer.memoryStorage(); // Store the uploaded files in memory buffer

// Configure multer upload settings
const upload = multer({ storage });

// Handle registration endpoint
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// Handle login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password matches
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Password is correct, login successful
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Handle certificate creation endpoint
app.post("/certificates", upload.single("image"), async (req, res) => {
  try {
    const { certificateName, certificateDetails } = req.body;
    const image = req.file.buffer.toString("base64");

    const certificate = new Certificate({
      image,
      certificateName,
      certificateDetails,
    });

    await certificate.save();

    res.status(201).json({ message: "Certificate created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Certificate creation failed", error: error.message });
  }
});

// Handle project creation endpoint
app.post("/projects", upload.single("projectImage"), async (req, res) => {
  try {
    const { projectName, projectDetails, projectLink } = req.body;
    const projectImage = req.file.buffer.toString("base64");

    const project = new Project({
      projectName,
      projectDetails,
      projectImage,
      projectLink,
    });

    await project.save();

    res.status(201).json({ message: "Project created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Project creation failed", error: error.message });
  }
});

// Fetch all certificates
app.get("/certificates", async (req, res) => {
  try {
    const certificates = await Certificate.find();

    const formattedCertificates = certificates.map((certificate) => {
      const imageData = certificate.image.toString('base64');
      return {
        ...certificate.toObject(),
        image: imageData,
      };
    });

    res.status(200).json(formattedCertificates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching certificates", error: error.message });
  }
});

// Fetch all projects
app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find();

    const formattedProjects = projects.map((project) => {
      const projectImageData = project.projectImage.toString('base64');
      return {
        ...project.toObject(),
        projectImage: projectImageData,
      };
    });

    res.status(200).json(formattedProjects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
