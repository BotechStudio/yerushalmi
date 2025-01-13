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
  ROUGH_DATE: { type: Date },
  ROUGH_WEIGHT: { type: String },
  CertificateUrl: { type: String },
  RoughVideo: { type: String },
  PolishedVideo: { type: String },
  HTMLTemplate: { type: Boolean }, // New field for storing the HTML template
  // add new for the new diamonds
  StockNumber: { type: String },
  Img: { type: String },
  JewleryVideo: { type: String },
  JewelryType: { type: String },
  // SubType: { type: String },
  Style: { type: String },
  Metal: { type: String },
  DiaWt: { type: String },
  // DiaQty: { type: String },
  // GSQty: { type: String },
  // GSWt: { type: String },
  // MetalWt: { type: String },
  MainStone: { type: String },
  Description: { type: String },
  Header: { type: String },
  Main: { type: String },
  Secondary: { type: String },
  GenerateDate: { type: Date },
  // SideStone: { type: String },
  // SideStoneShape: { type: String },
  // SideStoneWt: { type: String },
  // SideStoneColor: { type: String },
  // SideClarity: { type: String },
  // Brand: { type: String },
  // CertNumber: { type: String },
  // Remarks: { type: String },
  // MemoInvoiceDescription: { type: String },
  // Price: { type: String },
});

const DiamondNew = mongoose.model("Diamond_new", diamondNewSchema);

module.exports = DiamondNew;
