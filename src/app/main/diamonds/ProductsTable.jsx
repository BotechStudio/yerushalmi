import { useMemo, useEffect, useState } from "react";
import DataTable from "app/shared-components/data-table/DataTable";
import FuseLoading from "@fuse/core/FuseLoading";
import { Chip, ListItemIcon, MenuItem, Paper, Snackbar } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Link } from "react-router-dom";
import Typography from "@mui/material/Typography";
import clsx from "clsx";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import fetchData from "src/api/fetchData";
import { saveAs } from "file-saver";
import QRCode from "qrcode.react";
import axios from "axios";

function ProductsTable({ disabled }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDiamonds, setSelectedDiamonds] = useState([]);
  const [disabledDiamonds, setDisabledDiamonds] = useState({});
  const [syncMessage, setSyncMessage] = useState(""); // State for displaying sync status message
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar visibility
  const [wsError, setWsError] = useState(null);
  const [webSocket, setWebSocket] = useState(null);

  // Function to fetch data from the server
  const getData = async () => {
    try {
      const data = await fetchData();
      console.log("Fetched data in App:", data);
      setProducts(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error in App useEffect:", error);
      setIsLoading(false);
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    getData(); // Call getData to fetch initial data
    // const token = import.meta.env.VITE_TOKEN;
    const ws = new WebSocket("ws://localhost:5000/yerushalmi/diamonds");
    ws.onopen = () => {
      console.log("WebSocket connected");
      setWebSocket(ws); // Store WebSocket instance in state
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.message === "Data updated") {
        setProducts(message.data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsError(error.message || "WebSocket error occurred");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      // Optional: Attempt to reconnect WebSocket here if needed
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleSelectDiamond = (diamond) => {
    setSelectedDiamonds((prevSelected) => [
      ...prevSelected,
      diamond.VendorStockNumber,
    ]);
    setDisabledDiamonds((prevDisabled) => ({
      ...prevDisabled,
      [diamond.VendorStockNumber]: true,
    }));
    console.log("selectedDiamonds:", selectedDiamonds);
  };

  const handleSyncAndGenerateHTML = async (diamonds) => {
    console.log("Syncing selected diamonds:", diamonds);
    try {
      const token = import.meta.env.VITE_TOKEN;

      const response = await axios.post(
        "http://localhost:5000/yerushalmi/diamond/generateHtmlTemplates",
        { vendorStockNumbers: diamonds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("HTML Templates generated:", response.data);

      // Display success message
      setSyncMessage("HTML templates generated and saved successfully");
      setSnackbarOpen(true);
      // Refresh data after successful sync
      await getData();
      // Clear selected diamonds after generating HTML
      setSelectedDiamonds([]);
      setDisabledDiamonds({});
    } catch (error) {
      console.error("Error syncing and generating HTML templates:", error);

      // Display error message
      setSyncMessage("Failed to generate HTML templates");
      setSnackbarOpen(true);
    }
  };
  const handleDeleteSelectedDiamonds = async (diamonds) => {
    console.log("Deleting selected diamonds:", diamonds);
    try {
      const token = import.meta.env.VITE_TOKEN;

      const response = await axios.delete(
        "http://localhost:5000/yerushalmi/diamonds/byVendorStockNumber",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: { VendorStockNumbers: diamonds }, // Sending the VendorStockNumbers in the request body
        }
      );

      console.log("Diamonds deleted:", response.data);

      // Display success message
      setSyncMessage("Diamonds deleted successfully");
      setSnackbarOpen(true);

      // Refresh data after successful deletion
      getData();
      // Optionally, refresh data after successful deletion
      const updatedProducts = products.filter(
        (product) => !diamonds.includes(product.VendorStockNumber)
      );
      setProducts(updatedProducts);
      setSelectedDiamonds([]);
      setDisabledDiamonds({});
    } catch (error) {
      console.error("Error deleting diamonds:", error);

      // Display error message
      setSyncMessage("Failed to delete diamonds");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "CertificateUrl",
        header: "Certificate Url",
        Cell: ({ row }) => (
          <Typography
            component={Link}
            to={row.original.CertificateUrl}
            className="underline"
            color="secondary"
            role="button"
            target="_blank"
          >
            {row.original.CertificateUrl}
          </Typography>
        ),
      },
      {
        accessorKey: "Clarity",
        header: "Clarity",
      },
      {
        accessorKey: "Color",
        header: "Color",
      },
      {
        accessorKey: "Cut",
        header: "Cut",
      },
      {
        accessorKey: "FluorescenceIntensity",
        header: "Fluorescence Intensity",
      },
      {
        accessorKey: "Lab",
        header: "Lab",
      },
      {
        accessorKey: "Polish",
        header: "Polish",
      },
      {
        accessorKey: "PolishedVideo",
        header: "Polished Video",
        Cell: ({ row }) => (
          <Typography
            component={Link}
            to={row.original.PolishedVideo}
            className="underline"
            color="secondary"
            role="button"
            target="_blank"
          >
            View Video
          </Typography>
        ),
      },
      {
        accessorKey: "ROUGH_CT",
        header: "ROUGH Carat",
      },
      {
        accessorKey: "ROUGH_DATE",
        header: "ROUGH Date",
      },
      {
        accessorKey: "RoughVideo",
        header: "Rough Video",
        Cell: ({ row }) => (
          <Typography
            component={Link}
            to={row.original.RoughVideo}
            className="underline"
            color="secondary"
            role="button"
            target="_blank"
          >
            View Video
          </Typography>
        ),
      },
      {
        accessorKey: "Shape",
        header: "Shape",
      },
      {
        accessorKey: "Symmetry",
        header: "Symmetry",
      },
      {
        accessorKey: "VendorStockNumber",
        header: "Vendor Stock Number",
      },
      {
        accessorKey: "Weight",
        header: "Weight",
      },
      // Add the new column for QR code
      {
        accessorKey: "QRCode",
        header: "QR Code",
        Cell: ({ row }) => (
          <QRCode
            value={`http://www.yerushalmi.online/${row.original.VendorStockNumber.replace(/\./g, "")}_NEW.html`}
            size={64}
          />
        ),
      },
    ],
    [selectedDiamonds, disabledDiamonds]
  );
  const renderTopToolbarCustomActions = ({ table }) => {
    const { rowSelection } = table.getState();

    if (Object.keys(rowSelection).length === 0) {
      return null;
    }

    const selectedRows = table.getSelectedRowModel().rows;
    const selectedVendorStockNumbers = selectedRows.map(
      (row) => row.original.VendorStockNumber
    );

    return (
      <div className="flex space-x-4">
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            handleDeleteSelectedDiamonds(selectedVendorStockNumbers);
            table.resetRowSelection();
          }}
          className="flex shrink min-w-40"
          color="secondary"
        >
          <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
          <span className="hidden sm:flex mx-8">Delete selected items</span>
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleSyncAndGenerateHTML(selectedVendorStockNumbers)}
          disabled={selectedVendorStockNumbers.length === 0}
        >
          <FuseSvgIcon size={20}>heroicons-outline:upload</FuseSvgIcon>
          <span className="mx-4 sm:mx-8">Sync Selected</span>
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return <FuseLoading />;
  }

  return (
    <Paper
      className="flex flex-col flex-auto shadow-3 rounded-t-16 overflow-hidden rounded-b-0 w-full h-full"
      elevation={0}
    >
      {disabled ? (
        <div className="w-full h-full flex items-center justify-center">
          <p>Table is disabled during CSV import.</p>
        </div>
      ) : (
        <DataTable
          data={products}
          columns={columns}
          renderTopToolbarCustomActions={renderTopToolbarCustomActions}
          renderRowActionMenuItems={({ closeMenu, row, table }) => [
            <MenuItem
              key={0}
              onClick={() => {
                console.log("Delete", row.original.id);
                closeMenu();
                table.resetRowSelection();
              }}
            >
              <ListItemIcon>
                <FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
              </ListItemIcon>
              Delete
            </MenuItem>,
          ]}
        />
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={syncMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Paper>
  );
}

export default ProductsTable;
