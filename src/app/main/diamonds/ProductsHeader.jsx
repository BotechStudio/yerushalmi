import { useMemo, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
// import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import axios from "axios";
/**
 * The products header.
 */
function ProductsHeader() {
  const [syncMessage, setSyncMessage] = useState(""); // State for displaying sync status message
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar visibility
  const [selectedFile, setSelectedFile] = useState(null); // State for selected file
  const [uploading, setUploading] = useState(false); // State for button disabled state

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };
  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTcyMDY4NjA2OCwiZXhwIjoxNzIwNjg5NjY4fQ.0zRy5fej9dKAfb4xy8LAT_kHu4-u5IJqbkjRej1qOPs";

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

      // Optionally, refresh data after successful upload
      // getData();
    } catch (error) {
      console.error("Error uploading file:", error);

      // Handle error message or further actions as needed
      setSyncMessage("Failed to upload file");
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
      setSelectedFile(null); // Reset file selection
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
      </div>
    </div>
  );
}

export default ProductsHeader;
