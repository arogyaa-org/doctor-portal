/**
 * Copyright © 2024, F2Fintech Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of F2Fintech Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with F2Fintech.
 */

import { Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';

export const datagridColumns = (): GridColDef[] => {
    const columns: GridColDef[] = [
        {
            field: 'patientId',
            headerName: 'Name',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            // sortable: false
        },
        {
            field: 'createdAt',
            headerName: 'Appointment Time',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            minWidth: 80,
            // sortable: false,
            renderCell: (params) => (
                <Typography>
                    {params.row ? format(new Date(params.row.createdAt), 'dd-MM-yy  hh:mm  a') : 'N/A'}
                </Typography>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1.5,
            sortable: false
        },
        // {
        //     field: 'description',
        //     headerName: 'Description',
        //     headerClassName: 'super-app-theme--header',
        //     flex: 2.5,
        //     headerAlign: 'center',
        //     align: 'center',
        //     renderCell: (params) => {
        //     },
        // },
    ];
    return columns;
};
