import { Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';

export const patientDatagridColumns = (): GridColDef[] => {
    const columns: GridColDef[] = [
        {
            field: 'username',
            headerName: 'Name',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
        },
        {
            field: 'email',
            headerName: 'Email',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1.5,
        },
        {
            field: 'phone',
            headerName: 'Phone',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
        },
        {
            field: 'city',
            headerName: 'City',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
        },
        {
            field: 'medical_history',
            headerName: 'Medical History',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 2,
            renderCell: (params) => (
                <Typography>
                    {params.row.medical_history ? params.row.medical_history.join(', ') : 'N/A'}
                </Typography>
            ),
        },
        {
            field: 'createdAt',
            headerName: 'Created At',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            minWidth: 80,
            renderCell: (params) => (
                <Typography>
                    {params.row ? format(new Date(params.row.createdAt), 'dd-MM-yy hh:mm a') : 'N/A'}
                </Typography>
            ),
        },
    ];
    return columns;
};
