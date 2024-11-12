import { Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';

export const specialityDatagridColumns = (): GridColDef[] => {
    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
        },
        {
            field: 'description',
            headerName: 'Description',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 2,
            renderCell: (params) => (
                <Typography>{params.row.description || 'N/A'}</Typography>
            ),
        },
        {
            field: 'imgUrl',
            headerName: 'Image URL',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1.5,
            renderCell: (params) => (
                <Typography>
                    {params.row.imgUrl ? params.row.imgUrl : 'N/A'}
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
            renderCell: (params) => (
                <Typography>
                    {params.row ? format(new Date(params.row.createdAt), 'dd-MM-yy hh:mm a') : 'N/A'}
                </Typography>
            ),
        },
        {
            field: 'updatedAt',
            headerName: 'Updated At',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            renderCell: (params) => (
                <Typography>
                    {params.row ? format(new Date(params.row.updatedAt), 'dd-MM-yy hh:mm a') : 'N/A'}
                </Typography>
            ),
        },
    ];
    return columns;
};
