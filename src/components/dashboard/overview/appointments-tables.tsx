import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import type { SxProps } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import dayjs from "dayjs";
import { alpha, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";

// Utility function to get token (can be used in the component)
import { Utility } from "@/utils";

// Define generic status map type
type StatusConfigType = Record<
  string,
  { label: string; color: "warning" | "success" | "error" | "info" | "default" }
>;

// Default status map for orders
const orderStatusMap: StatusConfigType = {
  pending: { label: "Pending", color: "warning" },
  delivered: { label: "Delivered", color: "success" },
  refunded: { label: "Refunded", color: "error" },
};

// Default status map for appointments
export const appointmentStatusMap: StatusConfigType = {
  scheduled: { label: "Scheduled", color: "info" },
  approved: { label: "Approved", color: "success" },
  completed: { label: "Completed", color: "success" },
  cancelled: { label: "Rejected", color: "error" },
  pending: { label: "Pending", color: "info" },
  rescheduled: { label: "Rescheduled", color: "warning" },
};

// Column definition type
export interface ColumnConfig {
  id: string;
  label: string;
  format?: (value: any, rowData: any) => React.ReactNode;
  sortable?: boolean;
  sortDirection?: "asc" | "desc";
  hideForRoles?: string[]; // New property to hide column for specific roles
  width?: string; // Column width control
}

// Generic data item interface
export interface TableItem {
  id: string;
  [key: string]: any;
}

export interface TableProps {
  items?: TableItem[];
  columns: ColumnConfig[];
  title?: string;
  statusKey?: string;
  statusMap?: StatusConfigType;
  actionButtonText?: string;
  onActionClick?: () => void;
  dateFormat?: string;
  sx?: SxProps;
  emptyMessage?: string;
  dense?: boolean;
}

export function ReusableTable({
  items = [],
  columns,
  title = "Data Table",
  statusKey = "status",
  statusMap = orderStatusMap,
  actionButtonText = "View all",
  onActionClick,
  dateFormat = "MMM D, YYYY",
  sx,
  emptyMessage = "No data available",
  dense = false,
}: TableProps): React.JSX.Element {
  const theme = useTheme();
  const { decodedToken } = Utility();
  const userRole = decodedToken()?.role || "";

  // Filter columns based on user role
  const visibleColumns = columns.filter(
    (column) => !column.hideForRoles?.includes(userRole)
  );

  // Strip the border with border-radius to avoid visual issues
  const cardSx = {
    ...sx,
    borderRadius: 2,
    boxShadow: theme.shadows[3],
    overflow: "hidden",
    transition: "box-shadow 0.3s ease-in-out",
    "&:hover": {
      boxShadow: theme.shadows[6],
    },
  };

  // Calculate table layout based on visible columns
  const tableLayout = "fixed"; // Use fixed layout to honor column widths

  return (
    <Card sx={cardSx}>
      <CardHeader
        title={
          <Typography variant="h6" fontWeight="bold" color="primary">
            {title}
          </Typography>
        }
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          padding: theme.spacing(1.5),
        }}
      />
      <Divider />
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table
          stickyHeader
          size={dense ? "small" : "medium"}
          sx={{
            tableLayout: tableLayout,
            width: "100%",
          }}
        >
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  sortDirection={column.sortDirection}
                  sx={{
                    backgroundColor: theme.palette.background.default,
                    fontWeight: "bold",
                    color: theme.palette.text.secondary,
                    width: column.width,
                    padding: theme.spacing(1.5),
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => {
                return (
                  <TableRow
                    hover
                    key={item.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                      },
                      cursor: "pointer",
                    }}
                  >
                    {visibleColumns.map((column) => {
                      // Handle status column with chips
                      if (column.id === statusKey && item[statusKey]) {
                        console.log(
                          `Status for item ${item.id}:`,
                          item[statusKey]
                        );
                        const { label, color } = statusMap[item[statusKey]] || {
                          label: "Unknown",
                          color: "default",
                        };
                        return (
                          <TableCell
                            key={column.id}
                            sx={{ padding: theme.spacing(1) }}
                          >
                            <Chip
                              color={color}
                              label={label}
                              size="small"
                              sx={{
                                fontWeight: "medium",
                                minWidth: 80,
                                textAlign: "center",
                                ...(color === "default" && {
                                  backgroundColor: theme.palette.grey[300],
                                  color: theme.palette.text.primary,
                                }),
                              }}
                            />
                          </TableCell>
                        );
                      }

                      // Handle date formatting
                      if (column.format) {
                        return (
                          <TableCell
                            key={column.id}
                            sx={{ padding: theme.spacing(1) }}
                          >
                            {column.format(item[column.id], item)}
                          </TableCell>
                        );
                      }

                      // Default rendering
                      return (
                        <TableCell
                          key={column.id}
                          sx={{ padding: theme.spacing(1) }}
                        >
                          {item[column.id]}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end", py: 1, px: 2 }}>
        <Button
          color="primary"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="contained"
          onClick={onActionClick}
          sx={{
            textTransform: "none",
            borderRadius: 1.5,
            px: 2,
          }}
        >
          {actionButtonText}
        </Button>
      </CardActions>
    </Card>
  );
}

// Export specific configurations for common use cases
export const orderColumns: ColumnConfig[] = [
  { id: "id", label: "Order", width: "25%" },
  {
    id: "customerName",
    label: "Customer",
    format: (value, rowData) => rowData.customer?.name || value,
    width: "30%",
  },
  {
    id: "createdAt",
    label: "Date",
    format: (value) => dayjs(value).format("MMM D, YYYY"),
    sortDirection: "desc",
    width: "25%",
  },
  { id: "status", label: "Status", width: "20%" },
];

export const todayAppointmentColumns: ColumnConfig[] = [
  { id: "patientName", label: "Patient", width: "40%" },
  {
    id: "doctorName",
    label: "Doctor",
    hideForRoles: ["doctor"],
    width: "35%",
  },
  {
    id: "time",
    label: "Time",
    format: (value) => dayjs(value).format("h:mm A"),
    width: "25%",
  },
  { id: "status", label: "Status", width: "25%" },
];

export const upcomingAppointmentColumns: ColumnConfig[] = [
  { id: "patientName", label: "Patient", width: "30%" },
  {
    id: "doctorName",
    label: "Doctor",
    hideForRoles: ["doctor"],
    width: "30%",
  },
  {
    id: "date",
    label: "Date",
    format: (value) => dayjs(value).format("MMM D, YYYY"),
    sortDirection: "asc",
    width: "20%",
  },
  {
    id: "time",
    label: "Time",
    format: (value) => dayjs(value).format("h:mm A"),
    width: "20%",
  },
  { id: "status", label: "Status", width: "20%" },
];

// Backward compatibility wrapper for LatestOrders
export interface Order {
  id: string;
  customer: { name: string };
  amount: number;
  status: "pending" | "delivered" | "refunded";
  createdAt: Date;
}

export interface LatestOrdersProps {
  orders?: Order[];
  sx?: SxProps;
}

export function LatestOrders({
  orders = [],
  sx,
}: LatestOrdersProps): React.JSX.Element {
  // Transform original orders to the format expected by ReusableTable
  const transformedOrders = orders.map((order) => ({
    id: order.id,
    customer: { name: order.customer.name },
    customerName: order.customer.name,
    amount: order.amount,
    status: order.status,
    createdAt: order.createdAt,
  }));

  return (
    <ReusableTable
      items={transformedOrders}
      columns={orderColumns}
      title="Latest orders"
      statusKey="status"
      statusMap={orderStatusMap}
      actionButtonText="View all"
      sx={sx}
    />
  );
}
