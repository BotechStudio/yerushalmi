require("dotenv").config();
const express = require("express");
const connectDB = require("./mongoose");
const authenticateToken = require("./authenticateToken");
const cors = require("cors");
const DiamondNew = require("./models/diamondNew");
const Color = require("./models/color");
const Shape = require("./models/shape");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); // Make sure bcrypt is required
const fs = require("fs");
const csv = require("csv-parser");
const FTPClient = require("ftp");
const path = require("path");
const moment = require("moment");
const multer = require("multer");
const simpleGit = require("simple-git");
const http = require("http");
const WebSocket = require("ws");

const app = express();
connectDB();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast function to send updates to all connected clients
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// FTP configuration
const ftpConfig = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
};

const git = simpleGit();

// WebSocket connection event
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Received message:", message);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Path to the directory containing the CSV files on the FTP server (root directory)
// const ftpDirPath = "/home/ftpuser/vegas stones csv.csv";

// Local path to save the downloaded CSV file
const localCsvPath = path.join(__dirname, "/data_ftp/data_new.csv"); // Ensure the file is saved in the current directory

// Function to download CSV file from FTP and save locally
// function downloadCsvFromFTP(callback) {
//   const client = new FTPClient();

//   client.on("ready", () => {
//     client.get(ftpDirPath, (err, stream) => {
//       if (err) {
//         console.error("Error downloading file from FTP:", err);
//         client.end();
//         return callback(err);
//       }

//       const writeStream = fs.createWriteStream(localCsvPath);

//       stream.once("close", () => {
//         console.log(`Downloaded file ${ftpDirPath} successfully`);
//         client.end();
//         callback();
//       });

//       stream.pipe(writeStream);
//       // stream.pipe(fs.createWriteStream(localCsvPath));
//       writeStream.on("error", (err) => {
//         console.error("Error writing to local file:", err);
//         client.end();
//         callback(err);
//       });
//     });
//   });

//   client.on("error", (err) => {
//     console.error("FTP client error:", err);
//   });
//   client.connect(ftpConfig);
// }

// Function to sanitize the file name
function sanitizeFileName(name) {
  return name.replace(/\./g, "").replace(/[^a-zA-Z0-9-_]/g, "");
}

// Function to download the most recent CSV file from FTP and save locally
function downloadLatestCsvFromFTP(callback) {
  const client = new FTPClient();

  client.on("ready", () => {
    client.list((err, list) => {
      if (err) {
        console.error("Error listing files on FTP:", err);
        client.end();
        return callback(err);
      }

      // Sort files by modification time
      list.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());

      // Get the most recent file
      const latestFile = list[0].name;

      console.log(`Downloading latest file: ${latestFile}`);

      client.get(latestFile, (err, stream) => {
        if (err) {
          console.error("Error downloading file from FTP:", err);
          client.end();
          return callback(err);
        }

        const writeStream = fs.createWriteStream(localCsvPath);

        stream.once("close", () => {
          console.log(`Downloaded file ${latestFile} successfully`);
          client.end();
          callback();
        });

        stream.pipe(writeStream);

        // Handle errors during writing
        writeStream.on("error", (err) => {
          console.error("Error writing to local file:", err);
          client.end();
          callback(err);
        });
      });
    });
  });

  client.on("error", (err) => {
    console.error("FTP client error:", err);
  });

  client.connect(ftpConfig);
}

// Read the HTML template
const templatePath = path.join(__dirname, "../docs/template.html");
const template = fs.readFileSync(templatePath, "utf-8");
// console.log("Template Path:", templatePath);

app.post("/yerushalmi/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(403).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(403).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

// Register Route
app.post("/yerushalmi/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash the plain-text password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    console.error("Error registering new user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//refresh
app.post("/yerushalmi/auth/refresh", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const newToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token: newToken });
  });
});

// Endpoint to update the HTMLTemplate field
app.put("/yerushalmi/diamonds/update-html-template", async (req, res) => {
  try {
    // Define the update
    const update = { HTMLTemplate: false };

    // Update all documents where HTMLTemplate is true
    const result = await DiamondNew.updateMany({ HTMLTemplate: true }, update);

    res
      .status(200)
      .json({ message: `${result.nModified} documents updated successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Error updating documents", error });
  }
});

// Function to replace placeholders with actual data
function generateHtml(data) {
  console.log("data:", data);
  if (moment(data.ROUGH_DATE, "DD/MM/YYYY", true).isValid()) {
    data.ROUGH_DATE = moment(data.ROUGH_DATE, "DD/MM/YYYY").format(
      "MMMM D, YYYY"
    );
  }

  console.log("data:", data);

  let html = template;
  Object.keys(data).forEach((key) => {
    const placeholder = `\${diamond.${key}}`;
    const value = data[key];
    // Replace the placeholder with the corresponding value, handling special characters
    html = html.split(placeholder).join(value || "");
  });
  return html;
}

// Function to process the CSV file and save data to MongoDB
function processCsvAndSaveToMongo() {
  const results = [];

  fs.createReadStream(localCsvPath)
    .pipe(csv())
    .on("data", (row) => {
      // Map CSV fields to MongoDB fields
      const mappedRow = {
        VendorStockNumber: row["VendorStockNumber"],
        Shape: row["Shape"],
        Weight: row["Weight"],
        Color: row["Color"],
        Clarity: row["Clarity"],
        Cut: row["Cut"],
        Polish: row["Polish"],
        Symmetry: row["Symmetry"],
        FluorescenceIntensity: row["FluorescenceIntensity"],
        Lab: row["Lab"],
        ROUGH_CT: row["ROUGH CT"], // Map "ROUGH CT" to "ROUGH_CT"
        ROUGH_DATE: row["ROUGH DATE"], // Map "ROUGH DATE" to "ROUGH_DATE"
        CertificateUrl: row["Certificate Url"],
        RoughVideo: row["Rough Video"], // Map "Rough Video" to "RoughVideo"
        PolishedVideo: row["Polished Video"], // Map "Polished Video" to "PolishedVideo"
      };

      generateHtml(mappedRow); // Generate and save the HTML template
      mappedRow.HTMLTemplate = true;
      results.push(mappedRow);
    })
    .on("end", async () => {
      try {
        await DiamondNew.insertMany(results);
        console.log("Data successfully saved to MongoDB");
      } catch (error) {
        console.error("Error saving data to MongoDB:", error);
      }
    });
}
const upload = multer({ dest: "uploads/" });

// Endpoint to upload and process CSV file
app.post(
  "/yerushalmi/upload-csv",
  authenticateToken,
  upload.single("file"),
  (req, res) => {
    const filePath = req.file.path;
    console.log("filePath:", filePath);
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // Map CSV fields to MongoDB fields
        const mappedRow = {
          VendorStockNumber: row["VendorStockNumber"],
          Shape: row["Shape"],
          Weight: row["Weight"],
          Color: row["Color"],
          Clarity: row["Clarity"],
          Cut: row["Cut"],
          Polish: row["Polish"],
          Symmetry: row["Symmetry"],
          FluorescenceIntensity: row["FluorescenceIntensity"],
          Lab: row["Lab"],
          ROUGH_CT: row["ROUGH CT"], // Map "ROUGH CT" to "ROUGH_CT"
          ROUGH_DATE: row["ROUGH DATE"], // Map "ROUGH DATE" to "ROUGH_DATE"
          CertificateUrl: row["Certificate Url"],
          RoughVideo: row["Rough Video"], // Map "Rough Video" to "RoughVideo"
          PolishedVideo: row["Polished Video"], // Map "Polished Video" to "PolishedVideo"
        };

        // generateHtml(mappedRow); // Generate and save the HTML template
        mappedRow.HTMLTemplate = false;
        results.push(mappedRow);
      })
      .on("end", async () => {
        try {
          await DiamondNew.insertMany(results);
          console.log("Data successfully saved to MongoDB");
          const updatedList = await DiamondNew.find({});
          broadcast({ message: "Data updated", data: updatedList });
          res.status(200).json({
            message: "File uploaded and processing started",
            data: updatedList,
          });
        } catch (error) {
          console.error("Error saving data to MongoDB:", error);
          res.status(500).json({
            message: "Error saving data to MongoDB",
            error,
          });
        }
      });

    // processCsvAndSaveToMongo(filePath);
    // res.status(200).json({ message: "File uploaded and processing started" });
  }
);

// Endpoint to generate HTML templates for multiple diamonds
app.post(
  "/yerushalmi/diamond/generateHtmlTemplates",
  authenticateToken,
  async (req, res) => {
    const { vendorStockNumbers } = req.body;

    if (!Array.isArray(vendorStockNumbers) || vendorStockNumbers.length === 0) {
      return res
        .status(400)
        .json({ message: "VendorStockNumbers should be a non-empty array" });
    }

    try {
      // Pull the latest changes from the repository
      // await git.pull("origin", "main");

      const diamonds = await DiamondNew.find({
        VendorStockNumber: { $in: vendorStockNumbers },
      }).lean();

      for (const diamond of diamonds) {
        // Generate HTML if not already present or is false
        if (!diamond.HTMLTemplate || diamond.HTMLTemplate === false) {
          console.log("diamond:", diamond);
          const htmlContent = generateHtml(diamond);

          // Sanitize the filename
          const sanitizedFileName = sanitizeFileName(
            `${diamond.VendorStockNumber}`
          );
          // Define the path for the HTML file../docs/template.html
          const htmlFilePath = path.join(
            __dirname,
            `../docs/${sanitizedFileName}.html`
          );

          // Write the HTML file to the specified path
          fs.writeFileSync(htmlFilePath, htmlContent, "utf-8");

          // Update HTMLTemplate field to true
          await DiamondNew.updateOne(
            { _id: diamond._id },
            { HTMLTemplate: true }
          );

          try {
            // Stage, commit, and push the changes using simple-git
            await git.add(htmlFilePath);
            await git.commit(
              `Add HTML template for ${diamond.VendorStockNumber}`
            );
            await git.push("origin", "main");
            // Update HTMLTemplate field to true
            await DiamondNew.updateOne(
              { _id: diamond._id },
              { HTMLTemplate: true }
            );
          } catch (gitError) {
            console.error(
              `Error during git operations for ${diamond.VendorStockNumber}:`,
              gitError
            );
            res.status(500).json({
              message: `Git operations failed for ${diamond.VendorStockNumber}`,
            });
            return;
          }
        }
      }

      res.json({ message: "HTML templates generated and saved successfully" });
    } catch (error) {
      console.error("Error generating HTML templates:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Endpoint to trigger the FTP download and save to MongoDB
app.post("/yerushalmi/import-diamonds", authenticateToken, (req, res) => {
  downloadLatestCsvFromFTP(() => {
    processCsvAndSaveToMongo();
    res
      .status(200)
      .json({ message: "FTP download initiated and data is being processed" });
  });
});

// generate token
app.post("/yerushalmi/generate-token", (req, res) => {
  const user = { id: 1, username: "testuser" }; // Example payload
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

app.get("/yerushalmi/data", authenticateToken, async (req, res) => {
  try {
    const data = await DiamondNew.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get all the diamond
app.get("/yerushalmi/diamonds", authenticateToken, async (req, res) => {
  console.log("res:", res);
  const { search, sort } = req.query;
  try {
    let query = {};
    if (search) {
      query = { ...query, dataField: { $regex: search, $options: "i" } };
    }
    let data = DiamondNew.find(query);

    if (sort) {
      const sortField = sort.split(":");
      data = data.sort({ [sortField[0]]: sortField[1] === "desc" ? -1 : 1 });
    }
    data = await data.exec();
    // Broadcast updated data to WebSocket clients
    const updatedList = await DiamondNew.find({});
    broadcast({ message: "Data updated", data: updatedList });
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to delete all documents from the diamonds_new collection
app.delete("/yerushalmi/diamonds", authenticateToken, async (req, res) => {
  try {
    await DiamondNew.deleteMany({});
    res.status(200).json({ message: "All diamonds deleted successfully" });
  } catch (error) {
    console.error("Error deleting diamonds:", error);
    res
      .status(500)
      .json({ message: "Failed to delete diamonds", error: error.message });
  }
});

// Endpoint to delete all documents from the diamonds_new collection by VendorStockNumber

app.delete(
  "/yerushalmi/diamonds/byVendorStockNumber",
  authenticateToken,
  async (req, res) => {
    const { VendorStockNumbers } = req.body;

    if (!VendorStockNumbers || !Array.isArray(VendorStockNumbers)) {
      return res
        .status(400)
        .json({ message: "VendorStockNumbers array is required" });
    }

    try {
      const result = await DiamondNew.deleteMany({
        VendorStockNumber: { $in: VendorStockNumbers },
      });
      res.status(200).json({
        message: `${result.deletedCount} diamonds deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting diamonds:", error);
      res
        .status(500)
        .json({ message: "Failed to delete diamonds", error: error.message });
    }
  }
);

//the all colors from the mongoDB
app.get("/yerushalmi/colors", async (req, res) => {
  try {
    const colors = await Color.find();
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching colors", error });
  }
});

//The all shapes from the mongoDB
app.get("/yerushalmi/shapes", async (req, res) => {
  try {
    const shapes = await Shape.find();
    res.json(shapes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching colors", error });
  }
});

// Endpoint to create a new diamond item
app.post("/yerushalmi/diamonds", async (req, res) => {
  const {
    VendorStockNumber,
    Shape,
    Weight,
    Color,
    Clarity,
    Cut,
    Polish,
    Symmetry,
    FluorescenceIntensity,
    Lab,
    ROUGH_CT,
    ROUGH_DATE,
    CertificateUrl,
    RoughVideo,
    PolishedVideo,
  } = req.body;

  try {
    const newDiamond = new DiamondNew({
      VendorStockNumber,
      Shape,
      Weight,
      Color,
      Clarity,
      Cut,
      Polish,
      Symmetry,
      FluorescenceIntensity,
      Lab,
      ROUGH_CT,
      ROUGH_DATE,
      CertificateUrl,
      RoughVideo,
      PolishedVideo,
    });

    await newDiamond.save();
    res.status(201).json(newDiamond);
  } catch (error) {
    console.error("Error creating diamond:", error);
    res
      .status(500)
      .json({ message: "Failed to create diamond", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
