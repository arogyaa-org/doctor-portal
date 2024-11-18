/**
 * Copyright © 2023, F2Fintech Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of F2Fintech Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with F2Fintech.
 */

import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

const LoadingSkeleton: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="h6" color="text.secondary">
        Loading Data...
      </Typography>
      <Box
        sx={{
          width: '90%',
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)', // Match your DataGrid column count
          gap: 1,
        }}
      >
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {Array.from({ length: 9 }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="rectangular"
                height={40}
                animation="wave"
              />
            ))}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default LoadingSkeleton;
