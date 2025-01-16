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
const { Parser } = require("json2csv");
const ftp = require("basic-ftp");

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
  secure: true, // Enable encryption for the connection
  secureOptions: {
    rejectUnauthorized: false, // Allow self-signed certificates, if necessary
  },
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

async function generateHtmlTemplates(diamonds) {
  const filesToAdd = [];

  for (const diamond of diamonds) {
    // Generate HTML if not already present or is false
    if (!diamond.HTMLTemplate || diamond.HTMLTemplate === false || true) {
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

      // Add file path to the list of files to add to git
      filesToAdd.push(htmlFilePath);

      // Update HTMLTemplate field to true and set the GenerateDate
      await DiamondNew.updateOne(
        { _id: diamond._id },
        {
          HTMLTemplate: true,
          GenerateDate: new Date(), // Set GenerateDate to current date and time
        }
      );
    }
  }

  if (filesToAdd.length > 0) {
    try {
      // Stage all the new files
      await git.add(filesToAdd);
      // Commit the changes
      await git.commit("Add HTML templates");
      // Push the changes
      await git.push("origin", "main");
    } catch (gitError) {
      console.error("Error during git operations:", gitError);
      throw new Error("Git operations failed: " + gitError.message);
    }
  }
}

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
// Function to download a file from FTP
async function downloadFileFromFTP(remoteFilePath, localFilePath) {
  const client = new ftp.Client();
  client.ftp.verbose = true; // Optional: enable logging

  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: true,
      // secureOptions: {
      //   rejectUnauthorized: false, // Bypass certificate validation
      // },
    });

    console.log(`Connected to FTP server. Downloading ${remoteFilePath}...`);
    await client.downloadTo(localFilePath, remoteFilePath);
    console.log(`File downloaded to ${localFilePath}`);
  } catch (err) {
    console.error("FTP error:", err);
    throw err;
  } finally {
    client.close();
  }
}

// Define the Date prototype methods
Date.prototype.today = function () {
  return this.toISOString().split("T")[0]; // returns the date part of the ISO string
};

Date.prototype.timeNow = function () {
  return this.toTimeString().split(" ")[0]; // returns the time part of the string
};

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
const templatePath = path.join(__dirname, "../docs/template_new.html");
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
  // Check if required fields are present
  const requiredFields = ["StockNumber", "Img", "Description"];
  const hasRequiredFields = requiredFields.every((field) => data[field]);

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
  // Show or hide the new section
  if (hasRequiredFields) {
    console.log("hey hey");
    html = html.replace(
      '<section id="section-polished" class="section more-info-section first" style="display: none;">',
      '<section id="section-polished" class="section more-info-section first">'
    );
  }

  return html;
}

//function to detect changes and generate HTML templates:
async function detectChangesAndGenerateHtml() {
  const diamonds = await DiamondNew.find({}).lean();
  const changedDiamonds = [];

  for (const diamond of diamonds) {
    const storedDiamond = await DiamondNew.findOne({
      VendorStockNumber: diamond.VendorStockNumber,
    }).lean();
    if (!storedDiamond) continue;

    const hasChanged = Object.keys(diamond).some((key) => {
      return diamond[key] !== storedDiamond[key];
    });

    if (hasChanged) {
      changedDiamonds.push(diamond);
    }
  }

  if (changedDiamonds.length > 0) {
    await generateHtmlTemplates(changedDiamonds);
  }

  return changedDiamonds;
}

// Function to process the CSV file and save data to MongoDB
function processCsvAndSaveToMongo(callback) {
  const results = [];

  // Function to sanitize fields by removing unwanted characters
  function sanitizeField(value) {
    if (typeof value === "string") {
      return value.replace(/[\/\\.,\s]/g, ""); // Replace /, \, ., ,, and spaces with an empty string
    }
    return value; // Return the original value if it's not a string
  }

  fs.createReadStream(localCsvPath)
    .pipe(csv())
    .on("data", (row) => {
      // Map CSV fields to MongoDB fields with sanitization
      const mappedRow = {
        VendorStockNumber: sanitizeField(row["VendorStockNumber"]),
        Shape: row["Shape"],
        Weight: row["Weight"],
        Color: row["Color"],
        Clarity: row["Clarity"],
        Cut: row["Cut"],
        Polish: row["Polish"],
        Symmetry: row["Symmetry"],
        FluorescenceIntensity: row["FluorescenceIntensity"],
        Lab: row["Lab"],
        ROUGH_CT: row["ROUGH CT"],
        ROUGH_DATE: row["ROUGH DATE"],
        ROUGH_WEIGHT: row["ROUGH WEIGHT"],
        CertificateUrl: row["Certificate Url"],
        RoughVideo: row["Rough Video"],
        PolishedVideo: row["Polished Video"],
        StockNumber: row["StockNumber"],
        Img: row["Img"],
        JewleryVideo: row["Jewlery Video"],
        // SubType: row["SubType"],
        JewelryType: row["JewelryType"],
        Style: row["Style"],
        Metal: row["Metal"],
        DiaWt: row["DiaWt"],
        // DiaQty: row["DiaQty"],
        // GSQty: row["GSQty"],
        // GSWt: row["GSWt"],
        // MetalWt: row["MetalWt"],
        MainStone: row["MainStone"],
        Description: row["Description"],
        Header: row["Header"],
        Main: row["Main"],
        Secondary: row["Secondary"],
        // SideStone: row["SideStone"],
        // SideStoneShape: row["SideStoneShape"],
        // SideStoneWt: row["SideStoneWt"],
        // SideStoneColor: row["SideStoneColor"],
        // SideClarity: row["SideClarity"],
        // Brand: row["Brand"],
        // CertNumber: row["CertNumber"],
        // Remarks: row["Remarks"],
        // MemoInvoiceDescription: row["MemoInvoiceDescription"],
        // Price: row["Price"],
        HTMLTemplate: false, // Default value
      };

      results.push(mappedRow);
    })
    .on("end", async () => {
      try {
        const insertedDiamonds = [];
        for (const diamond of results) {
          const existingDiamond = await DiamondNew.findOne({
            VendorStockNumber: diamond.VendorStockNumber,
          });
          if (!existingDiamond) {
            const newDiamond = await DiamondNew.create(diamond);
            insertedDiamonds.push(newDiamond);
            console.log(
              `Inserted diamond with VendorStockNumber: ${diamond.VendorStockNumber}`
            );
          } else {
            console.log(
              `Skipped existing diamond with VendorStockNumber: ${diamond.VendorStockNumber}`
            );
          }
        }
        const updatedList = await DiamondNew.find({});

        if (callback) {
          callback(null, { insertedDiamonds, updatedList });
        } else {
          console.log("Callback not provided");
        }

        console.log("Data processing completed");
      } catch (error) {
        console.error("Error saving data to MongoDB:", error);
        if (callback) callback(error);
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
          VendorStockNumber: sanitizeFileName(row["VendorStockNumber"]),
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
          ROUGH_WEIGHT: row["ROUGH WEIGHT"], // Map "ROUGH DATE" to "ROUGH_WEIGHT"
          CertificateUrl: row["Certificate Url"],
          RoughVideo: row["Rough Video"], // Map "Rough Video" to "RoughVideo"
          PolishedVideo: row["Polished Video"], // Map "Polished Video" to "PolishedVideo"
          StockNumber: row["StockNumber"],
          JewelryType: row["JewelryType"],
          JewleryVideo: row["JewleryVideo"],
          MainStone: row["MainStone"],
          Metal: row["Metal"],
          Style: row["Style"],
          DiaWt: row["DiaWt"],
          Header: row["Header"],
          Main: row["Main"],
          Secondary: row["Secondary"],
          Description: row["Description"],
        };

        // generateHtml(mappedRow); // Generate and save the HTML template
        // mappedRow.HTMLTemplate = false;
        results.push(mappedRow);
      })

      .on("end", async () => {
        try {
          const insertedDiamonds = [];
          for (const diamond of results) {
            const existingDiamond = await DiamondNew.findOne({
              VendorStockNumber: diamond.VendorStockNumber,
            });
            console.log("existing Diamond:", existingDiamond);
            if (!existingDiamond) {
              const newDiamond = await DiamondNew.create(diamond);
              console.log("new Diamond:", newDiamond);
              insertedDiamonds.push(newDiamond);
              console.log(
                `Inserted diamond with VendorStockNumber: ${diamond.VendorStockNumber}`
              );
            } else {
              console.log(
                `Skipped existing diamond with VendorStockNumber: ${diamond.VendorStockNumber}`
              );
            }
          }
          // Generate HTML templates for new diamonds
          if (insertedDiamonds.length > 0) {
            await generateHtmlTemplates(insertedDiamonds);
          }
          const updatedList = await DiamondNew.find({});
          broadcast({ message: "Data updated", data: updatedList });
          res.status(200).json({
            message: "File uploaded and processing started",
            data: updatedList,
          });
          console.log("Data processing completed");
        } catch (error) {
          console.error("Error saving data to MongoDB:", error);
          res.status(500).json({
            message: "Error saving data to MongoDB",
            error,
          });
        }
        // Optionally, delete the uploaded file to free up disk space
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });

    // processCsvAndSaveToMongo(filePath);
    // res.status(200).json({ message: "File uploaded and processing started" });
  }
);

app.post(
  "/yerushalmi/diamond/generateHtmlTemplates",
  authenticateToken,
  async (req, res) => {
    const { vendorStockNumbers } = req.body;
    console.log("vendorStockNumbers:", vendorStockNumbers);

    if (!Array.isArray(vendorStockNumbers) || vendorStockNumbers.length === 0) {
      return res
        .status(400)
        .json({ message: "VendorStockNumbers should be a non-empty array" });
    }

    try {
      const diamonds = await DiamondNew.find({
        VendorStockNumber: { $in: vendorStockNumbers },
      }).lean();
      console.log("diamonds:", diamonds);

      await generateHtmlTemplates(diamonds);

      res.json({ message: "HTML templates generated and saved successfully" });
    } catch (error) {
      console.error("Error generating HTML templates:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

app.post(
  "/yerushalmi/diamond/update-changes",
  authenticateToken,
  async (req, res) => {
    try {
      const changedDiamonds = await detectChangesAndGenerateHtml();

      if (changedDiamonds.length > 0) {
        // Update the changed diamonds in the database
        for (const diamond of changedDiamonds) {
          await DiamondNew.updateOne({ _id: diamond._id }, diamond);
        }
        res.json({
          message:
            "HTML templates for changed diamonds generated and saved successfully",
          changedDiamonds,
        });
      } else {
        res.json({ message: "No changes detected in diamonds" });
      }
    } catch (error) {
      console.error("Error updating and generating HTML templates:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Endpoint to trigger the FTP download and save to MongoDB
app.post("/yerushalmi/import-diamonds", authenticateToken, (req, res) => {
  downloadLatestCsvFromFTP(() => {
    processCsvAndSaveToMongo((err, result) => {
      if (err) {
        console.error("Error processing CSV and saving to MongoDB:", err);
        return;
      }

      console.log("CSV processing result:", result);
    });
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

// Endpoint to quick test if server is online (no auth)
app.get("/ping", async (req, res) => {
  try {
    res.status(200).json({
      message:
        "Yerushalmi server is online! " +
        new Date().today() +
        " @ " +
        new Date().timeNow(),
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Failed to process request", error: error.message });
  }
});
// // Endpoint to delete all documents from the diamonds_new collection by VendorStockNumber

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
      // Fetch the diamonds to get their HTML filenames
      const diamonds = await DiamondNew.find({
        VendorStockNumber: { $in: VendorStockNumbers },
      }).lean();

      // Collect the paths of the HTML files to delete
      const filesToDelete = diamonds.map((diamond) =>
        path.join(
          __dirname,
          `../docs/${sanitizeFileName(diamond.VendorStockNumber)}.html`
        )
      );

      // Delete the diamonds from the database
      const result = await DiamondNew.deleteMany({
        VendorStockNumber: { $in: VendorStockNumbers },
      });

      // Delete the HTML files from the filesystem
      for (const filePath of filesToDelete) {
        console.log("filePath:", filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      if (filesToDelete.length > 0) {
        try {
          // Stage the deleted files
          await git.rm(filesToDelete);
          // Commit the changes
          await git.commit("Delete HTML templates");
          // Push the changes
          await git.push("origin", "main");
        } catch (gitError) {
          console.error("Error during git operations:", gitError);
          return res.status(500).json({
            message: "Git operations failed",
            error: gitError.message,
          });
        }
      }

      res.status(200).json({
        message: `${result.deletedCount} diamonds and their HTML templates deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting diamonds:", error);
      res
        .status(500)
        .json({ message: "Failed to delete diamonds", error: error.message });
    }
  }
);

// app.delete(
//   "/yerushalmi/diamonds/byVendorStockNumber",
//   authenticateToken,
//   async (req, res) => {
//     const { VendorStockNumbers } = req.body;

//     if (!VendorStockNumbers || !Array.isArray(VendorStockNumbers)) {
//       return res
//         .status(400)
//         .json({ message: "VendorStockNumbers array is required" });
//     }

//     try {
//       const result = await DiamondNew.deleteMany({
//         VendorStockNumber: { $in: VendorStockNumbers },
//       });
//       res.status(200).json({
//         message: `${result.deletedCount} diamonds deleted successfully`,
//       });
//     } catch (error) {
//       console.error("Error deleting diamonds:", error);
//       res
//         .status(500)
//         .json({ message: "Failed to delete diamonds", error: error.message });
//     }
//   }
// );

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
    ROUGH_WEIGHT,
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
      ROUGH_WEIGHT,
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

app.get("/yerushalmi/export-diamonds", authenticateToken, async (req, res) => {
  try {
    const diamonds = await DiamondNew.find({}).lean();

    const fields = [
      "VendorStockNumber",
      "Shape",
      "Weight",
      "Color",
      "Clarity",
      "Cut",
      "Polish",
      "Symmetry",
      "FluorescenceIntensity",
      "Lab",
      "ROUGH_CT",
      "ROUGH_DATE",
      "ROUGH_WEIGHT",
      "CertificateUrl",
      "RoughVideo",
      "PolishedVideo",
      "HTMLTemplate",
      "StockNumber",
      "Img",
      "Vid",
      "JewelryType",
      "JewleryVideo",
      // "SubType",
      "Style",
      "Metal",
      "DiaWt",
      // "GSQty",
      // "GSWt",
      // "MetalWt",
      "MainStone",
      "Header",
      "Main",
      "Secondary",
      "Description",
      // "SideStone",
      // "SideStoneShape",
      // "SideStoneWt",
      // "SideStoneColor",
      // "SideClarity",
      // "Brand",
      // "CertNumber",
      // "Remarks",
      // "MemoInvoiceDescription",
      // "Price",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(diamonds);

    res.header("Content-Type", "text/csv");
    res.attachment("diamonds.csv");
    res.send(csv);
  } catch (error) {
    console.error("Error exporting diamonds:", error);
    res.status(500).json({ message: "Error exporting diamonds", error });
  }
});

// Endpoint to download the CSV_template.csv file from FTP and send it to the client
app.get(
  "/yerushalmi/download-ftp-file",
  authenticateToken,
  async (req, res) => {
    const remoteFilePath = "CSV_template.csv"; // Replace with the exact path on your FTP server
    const localFilePath = path.join(__dirname, "downloads", "CSV_template.csv"); // Temporary local file path

    try {
      // Ensure the downloads directory exists
      if (!fs.existsSync(path.join(__dirname, "downloads"))) {
        fs.mkdirSync(path.join(__dirname, "downloads"));
      }

      // Download the specific file from FTP
      await downloadFileFromFTP(remoteFilePath, localFilePath);

      // Send the file to the client for download
      res.download(localFilePath, "CSV_template.csv", (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Error downloading the file.");
        } else {
          // Delete the local file after download
          fs.unlinkSync(localFilePath);
        }
      });
    } catch (error) {
      console.error("Error downloading file from FTP:", error);
      res
        .status(500)
        .json({ message: "Failed to download the CSV template file." });
    }
  }
);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
