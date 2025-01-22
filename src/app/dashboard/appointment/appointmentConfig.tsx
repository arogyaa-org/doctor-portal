/**
 * Copyright © 2024, F2Fintech Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of F2Fintech Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with F2Fintech.
 */

import { Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { Utility } from '@/utils';

export const datagridColumns = (): GridColDef[] => {
    const { capitalizeFirstLetter } = Utility();

    const columns: GridColDef[] = [
        {
            field: 'patientId',
            headerName: 'Patient Name',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            renderCell: ({ row: { patientId } }) => (
                <Typography>
                    {capitalizeFirstLetter(patientId?.username) || 'N/A'}
                </Typography>
            ),
        },
        {
            field: 'doctorId',
            headerName: 'Doctor Name',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            renderCell: ({ row: { doctorId } }) => (
                <Typography>
                    {capitalizeFirstLetter(doctorId?.username) || 'N/A'}
                </Typography>
            ),
        },
        {
            field: 'appointmentDate',
            headerName: 'Date',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            minWidth: 80,
            renderCell: ({ row: { appointmentDate } }) => (
                <Typography>
                    {appointmentDate
                        ? format(new Date(appointmentDate), 'dd-MM-yyyy')
                        : 'N/A'}
                </Typography>
            ),
        },
        {
            field: 'appointmentTime',
            headerName: 'Time',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            minWidth: 80,
            renderCell: ({ row: { appointmentTime } }) => (
                <Typography>{appointmentTime || 'N/A'}</Typography>
            ),
        },
        {
            field: 'appointmentType',
            headerName: 'Type',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            minWidth: 80,
            renderCell: ({ row: { appointmentType } }) => (
                <Typography>
                    {capitalizeFirstLetter(appointmentType) || 'N/A'}
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
            sortable: false,
            renderCell: ({ row: { status } }) => (
                <Typography>
                    {capitalizeFirstLetter(status) || 'N/A'}
                </Typography>
            ),
        },
    ];

    return columns;
};
