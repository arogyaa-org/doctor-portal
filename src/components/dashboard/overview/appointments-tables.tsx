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
  ongoing: { label: "Ongoing", color: "warning" },
  completed: { label: "Completed", color: "success" },
  cancelled: { label: "Cancelled", color: "error" },
  noShow: { label: "No Show", color: "error" },
};

// Column definition type
export interface ColumnConfig {
  id: string;
  label: string;
  format?: (value: any, rowData: any) => React.ReactNode;
  sortable?: boolean;
  sortDirection?: "asc" | "desc";
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
  minWidth?: number;
  dateFormat?: string;
  sx?: SxProps;
}

export function ReusableTable({
  items = [],
  columns,
  title = "Data Table",
  statusKey = "status",
  statusMap = orderStatusMap,
  actionButtonText = "View all",
  onActionClick,
  minWidth = 800,
  dateFormat = "MMM D, YYYY",
  sx,
}: TableProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardHeader title={title} />
      <Divider />
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} sortDirection={column.sortDirection}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              return (
                <TableRow hover key={item.id}>
                  {columns.map((column) => {
                    // Handle status column with chips
                    if (column.id === statusKey && item[statusKey]) {
                      const { label, color } = statusMap[item[statusKey]] || {
                        label: "Unknown",
                        color: "default",
                      };
                      return (
                        <TableCell key={column.id}>
                          <Chip color={color} label={label} size="small" />
                        </TableCell>
                      );
                    }

                    // Handle date formatting
                    if (column.format) {
                      return (
                        <TableCell key={column.id}>
                          {column.format(item[column.id], item)}
                        </TableCell>
                      );
                    }

                    // Default rendering
                    return (
                      <TableCell key={column.id}>{item[column.id]}</TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
          onClick={onActionClick}
        >
          {actionButtonText}
        </Button>
      </CardActions>
    </Card>
  );
}

// Export specific configurations for common use cases
export const orderColumns: ColumnConfig[] = [
  { id: "id", label: "Order" },
  {
    id: "customerName",
    label: "Customer",
    format: (value, rowData) => rowData.customer?.name || value,
  },
  {
    id: "createdAt",
    label: "Date",
    format: (value) => dayjs(value).format("MMM D, YYYY"),
    sortDirection: "desc",
  },
  { id: "status", label: "Status" },
];

export const todayAppointmentColumns: ColumnConfig[] = [
  { id: "patientName", label: "Patient" },
  { id: "doctorName", label: "Doctor" },
  {
    id: "time",
    label: "Time",
    format: (value) => dayjs(value).format("h:mm A"),
  },
  { id: "status", label: "Status" },
];

export const upcomingAppointmentColumns: ColumnConfig[] = [
  { id: "patientName", label: "Patient" },
  { id: "doctorName", label: "Doctor" },
  {
    id: "date",
    label: "Date",
    format: (value) => dayjs(value).format("MMM D, YYYY"),
    sortDirection: "asc",
  },
  {
    id: "time",
    label: "Time",
    format: (value) => dayjs(value).format("h:mm A"),
  },
  { id: "status", label: "Status" },
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
