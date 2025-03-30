const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // File system module
const Resume = require("../models/Resume"); // Import Resume model
const { nanoid } = require("nanoid");

const router = express.Router();

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files inside an "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// File filter to allow PDFs and images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only PDFs and images are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

/**
 * @route POST /api/resumes/upload
 * @desc Upload Resume (PDF/Image + Form Data)
 */
router.post("/upload", upload.single("resumeFile"), async (req, res) => {
  try {
    // Ensure body values are correctly formatted
    const name = req.body.name ? req.body.name.replace(/^"|"$/g, "") : null;
    const email = req.body.email ? req.body.email.replace(/^"|"$/g, "") : null;
    const phone = req.body.phone ? req.body.phone.replace(/^"|"$/g, "") : null;
    const skills = req.body.skills ? req.body.skills.replace(/^"|"$/g, "").split(",") : [];
    const experience = req.body.experience ? req.body.experience.replace(/^"|"$/g, "") : null;
    const education = req.body.education ? req.body.education.replace(/^"|"$/g, "") : null;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required!" });
    }

    const uniqueID = nanoid(8);
    const resumeFile = req.file ? `/uploads/${req.file.filename}` : null;
    const newResume = new Resume({
      uniqueID,
      name,
      email,
      phone,
      skills,
      experience,
      education,
      resumeFile,
    });

    console.log("Saving resume to database:", newResume); // Debugging

    await newResume.save();
    
    console.log("✅ Resume saved successfully!");

    res.json({ message: "Resume uploaded successfully!", uniqueID });
  } catch (error) {
    console.error("❌ MongoDB Save Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// /**
//  * @route GET /api/resumes/:id
//  * @desc Fetch a resume by unique ID
//  */
// router.get("/:id", async (req, res) => {
//   try {
//     const resume = await Resume.findOne({ uniqueID: req.params.id });

//     if (!resume) {
//       return res.status(404).json({ message: "Resume not found!" });
//     }

//     res.json(resume);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

/**
 * @route GET /api/resumes/download/:id
 * @desc Download a resume file by unique ID
 */
router.get("/download/:id", async (req, res) => {
  try {
    const resume = await Resume.findOne({ uniqueID: req.params.id });

    if (!resume || !resume.resumeFile) {
      return res.status(404).json({ message: "Resume not found!" });
    }

    const filePath = path.join(__dirname, "..", resume.resumeFile);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server!" });
    }

    // Send the file for download
    res.download(filePath, path.basename(filePath), (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
