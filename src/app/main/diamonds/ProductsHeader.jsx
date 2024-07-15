import { useMemo, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
// import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import axios from "axios";
import fetchData from "src/api/fetchData"; /**
 * The products header.
 */
function ProductsHeader({ setTableDisabled }) {
  const [syncMessage, setSyncMessage] = useState(""); // State for displaying sync status message
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar visibility
  const [selectedFile, setSelectedFile] = useState(null); // State for selected file
  const [uploading, setUploading] = useState(false); // State for button disabled state

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
      const token = import.meta.env.VITE_TOKEN;

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

  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  return (
    <div className="flex space-y-12 sm:space-y-0 flex-1 w-full items-center justify-between py-8 sm:py-16 px-16 md:px-24">
      <motion.span
        initial={{ x: -20 }}
        animate={{ x: 0, transition: { delay: 0.2 } }}
      >
        <Typography className="text-24 md:text-32 font-extrabold tracking-tight">
          Diamonds
        </Typography>
      </motion.span>

      <div className="flex flex-1 items-center justify-end space-x-8">
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
        {/* Link to download CSV template */}
        <a
          href="/docs/CSV_template.csv"
          download="CSV_template.csv"
          className="flex items-center text-blue-500 hover:underline"
        >
          <FuseSvgIcon size={20}>
            heroicons-outline:document-download
          </FuseSvgIcon>
          <span className="ml-2">Download CSV Template</span>
        </a>
      </div>
    </div>
  );
}

export default ProductsHeader;
