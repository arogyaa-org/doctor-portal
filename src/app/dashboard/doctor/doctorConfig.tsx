import { Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';

export const doctorDatagridColumns = (): GridColDef[] => {
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
            field: 'specializationId',
            headerName: 'Specializations',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1.5,
            renderCell: (params) => (
                <Typography>
                    {params.row.specializationId ? params.row.specializationId.join(', ') : 'N/A'}
                </Typography>
            ),
        },
        {
            field: 'qualificationIds',
            headerName: 'Qualifications',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1.5,
            renderCell: (params) => (
                <Typography>
                    {params.row.qualificationIds ? params.row.qualificationIds.join(', ') : 'N/A'}
                </Typography>
            ),
        },
        {
            field: 'experienceYears',
            headerName: 'Experience (Years)',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
        },
        {
            field: 'bio',
            headerName: 'Bio',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 2,
            renderCell: (params) => (
                <Typography>{params.row.bio || 'N/A'}</Typography>
            ),
        },
        {
            field: 'availability',
            headerName: 'Availability',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1.5,
            renderCell: (params) => (
                <Typography>
                    {params.row.availability ? params.row.availability.join(', ') : 'N/A'}
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
    ];
    return columns;
};
