import React from 'react';
import { Box, Skeleton, Grid } from '@mui/material';

/** Placeholder shown while a page loads: title, a row of stat tiles and a content block. */
const PageSkeleton = ({ tiles = 4, rows = 1 }) => (
    <Box>
        <Skeleton variant="text" width={260} height={44} />
        <Skeleton variant="text" width={420} height={22} sx={{ mb: 3 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
            {Array.from({ length: tiles }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: Math.max(1, Math.floor(12 / tiles)) }}>
                    <Skeleton variant="rounded" height={96} />
                </Grid>
            ))}
        </Grid>
        {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={280} sx={{ mb: 2 }} />
        ))}
    </Box>
);

export default PageSkeleton;
