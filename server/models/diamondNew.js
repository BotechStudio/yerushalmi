const mongoose = require("mongoose");

const diamondNewSchema = new mongoose.Schema({
  VendorStockNumber: { type: String },
  Shape: { type: String },
  Weight: { type: String },
  Color: { type: String },
  Clarity: { type: String },
  Cut: { type: String },
  Polish: { type: String },
  Symmetry: { type: String },
  FluorescenceIntensity: { type: String },
  Lab: { type: String },
  ROUGH_CT: { type: String },
  ROUGH_DATE: { type: String },
  CertificateUrl: { type: String },
  RoughVideo: { type: String },
  PolishedVideo: { type: String },
  HTMLTemplate: { type: Boolean }, // New field for storing the HTML template
});

const DiamondNew = mongoose.model("Diamond_new", diamondNewSchema);

module.exports = DiamondNew;
