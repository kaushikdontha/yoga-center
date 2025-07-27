import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Skeleton } from '@mui/material';

const GalleryImage = ({ event }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Get the appropriate image URL
  const imageUrl = event.image?.medium || event.image?.original || event.image;

  // Hidden preloader image
  const preloadImage = () => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setError(true);
  };

  // Start preloading when component mounts
  React.useEffect(() => {
    if (imageUrl) {
      preloadImage();
    }
  }, [imageUrl]);

  if (error) {
    return (
      <Card>
        <CardMedia
          component="div"
          sx={{
            height: 0,
            paddingTop: '100%', // 1:1 aspect ratio
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Failed to load image
          </Typography>
        </CardMedia>
      </Card>
    );
  }

  return (
    <Card>
      {!imageLoaded ? (
        <Skeleton
          variant="rectangular"
          sx={{
            height: 0,
            paddingTop: '100%', // 1:1 aspect ratio
            bgcolor: 'grey.200'
          }}
        />
      ) : (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={event.title}
          sx={{
            height: 0,
            paddingTop: '100%', // 1:1 aspect ratio
            objectFit: 'cover',
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}
      
      {event.title && (
        <CardContent>
          <Typography variant="h6" component="h3" noWrap>
            {event.title}
          </Typography>
          {event.description && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {event.description}
            </Typography>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default GalleryImage; 