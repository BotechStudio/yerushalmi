import { useMemo, useEffect, useState } from "react";
import DataTable from "app/shared-components/data-table/DataTable";
import FuseLoading from "@fuse/core/FuseLoading";
import { Chip, ListItemIcon, MenuItem, Paper } from "@mui/material";
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

function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDiamonds, setSelectedDiamonds] = useState([]);
  const [disabledDiamonds, setDisabledDiamonds] = useState({});

  useEffect(() => {
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
    getData();
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
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTcyMDQ0NjgwMSwiZXhwIjoxNzIwNDUwNDAxfQ.eGr_ChZv9MjWp0kMBA6zUXlirGxJsnTlk-GXsp559dk";

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

      // Clear selected diamonds after generating HTML
      setSelectedDiamonds([]);
      setDisabledDiamonds({});
    } catch (error) {
      console.error("Error syncing and generating HTML templates:", error);
    }
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
      {
        accessorKey: "Select",
        header: "Select",
        Cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedDiamonds.includes(row.original.VendorStockNumber)}
            disabled={disabledDiamonds[row.original.VendorStockNumber]}
            onChange={() => handleSelectDiamond(row.original)}
          />
        ),
      },
      // Add the new column for QR code
      {
        accessorKey: "QRCode",
        header: "QR Code",
        Cell: ({ row }) => (
          <QRCode value={row.original.VendorStockNumber} size={64} />
        ),
      },
    ],
    [selectedDiamonds, disabledDiamonds]
  );

  if (isLoading) {
    return <FuseLoading />;
  }

  return (
    <Paper
      className="flex flex-col flex-auto shadow-3 rounded-t-16 overflow-hidden rounded-b-0 w-full h-full"
      elevation={0}
    >
      <motion.div
        className="flex flex-grow-0"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
      >
        <Button
          vlassName=""
          variant="contained"
          color="secondary"
          onClick={() => handleSyncAndGenerateHTML(selectedDiamonds)}
          disabled={selectedDiamonds.length === 0}
        >
          <FuseSvgIcon size={20}>heroicons-outline:upload</FuseSvgIcon>
          <span className="mx-4 sm:mx-8">Sync Selected</span>
        </Button>
      </motion.div>

      <DataTable
        data={products}
        columns={columns}
        renderRowActionMenuItems={({ closeMenu, row, table }) => [
          <MenuItem
            key={0}
            onClick={() => {
              // replace with your delete function
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
        renderTopToolbarCustomActions={({ table }) => {
          const { rowSelection } = table.getState();

          if (Object.keys(rowSelection).length === 0) {
            return null;
          }

          return (
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                const selectedRows = table.getSelectedRowModel().rows;
                // replace with your delete function
                console.log(
                  "Delete selected",
                  selectedRows.map((row) => row.original.id)
                );
                table.resetRowSelection();
              }}
              className="flex shrink min-w-40 ltr:mr-8 rtl:ml-8"
              color="secondary"
            >
              <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
              <span className="hidden sm:flex mx-8">Delete selected items</span>
            </Button>
          );
        }}
      />
    </Paper>
  );
}

export default ProductsTable;
