import React from 'react';
import { Container, Grid, Typography } from '@mui/material';
import GalleryImage from '../components/GalleryImage';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useApi } from '../hooks/useApi';

const Gallery = () => {
  const { data: events, loading, error } = useApi('/events', {
    params: {
      category: 'gallery',
      sort: '-date',
      limit: 50
    }
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load gallery images. Please try again later." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom>
        Gallery
      </Typography>
      
      <Grid container spacing={3}>
        {(events || []).map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <GalleryImage event={event} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

// Wrap component with React.memo to prevent unnecessary re-renders
export default React.memo(Gallery); 