import { useMemo, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
// import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import axios from "axios";
import fetchData from "src/api/fetchData";
import AuthService from "src/app/auth/services/AuthService";
import { saveAs } from "file-saver";

//  * The products header.
//  */

function ProductsHeader({ setTableDisabled }) {
  const [importing, setImporting] = useState(false); // State for button disabled state

  const [syncMessage, setSyncMessage] = useState(""); // State for displaying sync status message
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar visibility
  const [selectedFile, setSelectedFile] = useState(null); // State for selected file
  const [uploading, setUploading] = useState(false); // State for button disabled state

  const handleImportDiamonds = async () => {
    setImporting(true);
    setTableDisabled(true); // Optionally disable the table

    try {
      const token = AuthService.getToken();
      const response = await axios.post(
        "https://server.yerushalmi.online/yerushalmi/import-diamonds",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Import response:", response.data);
      setSyncMessage(response.data.message || "Import completed successfully");
    } catch (error) {
      console.error("Error importing diamonds:", error);
      setSyncMessage("Failed to import diamonds");
    } finally {
      setImporting(false);
      setTableDisabled(false); // Re-enable the table
    }
  };
  // Function to fetch data from the server
  const getData = async () => {
    try {
      const data = await fetchData();
      console.log("Fetched data in ProductsHeader:", data);
      // Update state with fetched data (if needed)
    } catch (error) {
      console.error("Error fetching data in ProductsHeader:", error);
      // Handle error as needed
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };
  const handleFileUpload = async (file) => {
    setUploading(true);
    setTableDisabled(true); // Disable the table when upload starts
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = AuthService.getToken();

      const response = await axios.post(
        "http://localhost:5000/yerushalmi/upload-csv",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("File upload response:", response.data);

      // Handle success message or further actions as needed
      setSyncMessage("File uploaded successfully");
      setSnackbarOpen(true);
      // //   Optionally, refresh data after successful upload
      getData();
    } catch (error) {
      console.error("Error uploading file:", error);

      // Handle error message or further actions as needed
      setSyncMessage("Failed to upload file");
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
      setSelectedFile(null); // Reset file selection
      setTableDisabled(false); // Re-enable the table when upload is finished
    }
  };

  const handleExport = async () => {
    try {
      const token = AuthService.getToken();
      const response = await axios.get(
        "https://server.yerushalmi.online/yerushalmi/export-diamonds",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Important for handling binary data
        }
      );
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(blob, "diamonds.csv");
    } catch (error) {
      console.error("Error exporting diamonds:", error);
    }
  };

  const handleUpdateChanges = async () => {
    console.log("Hey");
    try {
      const token = AuthService.getToken();
      const response = await axios.post(
        "http://localhost:5000/yerushalmi/diamond/update-changes",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Update changes response:", response);

      if (
        response.data.changedDiamonds &&
        response.data.changedDiamonds.length > 0
      ) {
        // Handle success message or further actions as needed
        setSyncMessage(response.data.message);
        setSnackbarOpen(true);
        // Optionally, refresh data after successful update
        getData();
      } else {
        // Handle case where no changes were detected
        setSyncMessage("No changes detected in diamonds");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error updating changes:", error);

      // Handle error message or further actions as needed
      setSyncMessage("Failed to update changes");
      setSnackbarOpen(true);
    }
  };

  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  return (
    <div className="flex flex-1 w-full items-center justify-between py-8 sm:py-16 px-16 md:px-24 space-y-8 flex-col sm:flex-row">
      <motion.span
        initial={{ x: -20 }}
        animate={{ x: 0, transition: { delay: 0.2 } }}
      >
        <Typography className="text-24 md:text-32 font-extrabold tracking-tight">
          Diamonds
        </Typography>
      </motion.span>

      <div className="flex flex-col flex-1 items-center justify-end space-y-8">
        {/* First Row: Import CSV and Export Table */}
        <div className="flex flex-row flex-wrap items-center justify-end space-x-8">
          <motion.div
            className="flex flex-grow-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                color="secondary"
                component="span"
                disabled={uploading}
              >
                <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
                <span className="mx-4 sm:mx-8">
                  {uploading ? "Uploading..." : "Import CSV"}
                </span>
              </Button>
            </label>
          </motion.div>

          <Button variant="contained" color="secondary" onClick={handleExport}>
            <FuseSvgIcon size={20}>heroicons-outline:download</FuseSvgIcon>
            <span className="mx-4 sm:mx-8">Export Table</span>
          </Button>
        </div>

        {/* Second Row: Download CSV Template */}
        <div className="flex flex-row items-center justify-end">
          <Button
            variant="contained"
            color="primary"
            sx={{
              color: "white", // Ensure the text is white
              "& .MuiSvgIcon-root": {
                color: "white", // Ensures icons inside the button are also white
              },
            }}
          >
            <a
              href="https://www.yerushalmi.online/CSV_template.csv"
              download="CSV_template.csv"
              className="flex items-center text-white no-underline"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <FuseSvgIcon size={20}>
                heroicons-outline:document-download
              </FuseSvgIcon>
              <span className="ml-2">Download CSV Template</span>
            </a>
          </Button>
          {/* Button to trigger import diamonds */}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleImportDiamonds}
            disabled={importing} // Disable while importing
          >
            <FuseSvgIcon size={20}>heroicons-outline:refresh</FuseSvgIcon>
            <span className="mx-4 sm:mx-8">
              {importing ? "Importing..." : "Import Diamonds"}
            </span>
          </Button>
          {/* <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateChanges}
          >
            <FuseSvgIcon size={20}>heroicons-outline:refresh</FuseSvgIcon>
            <span className="mx-4 sm:mx-8">Update Changes</span>
          </Button> */}
        </div>
      </div>
    </div>
  );
}

export default ProductsHeader;
