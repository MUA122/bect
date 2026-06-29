import React from 'react';
import { Box, Container } from '@mui/material';
import './HomeFlyerSection.css';

function HomeFlyerSection() {
  return (
    <Box component="section" className="home-flyer-section">
      <Container maxWidth="xl" className="home-flyer-shell">
        <Box className="home-flyer-frame">
          <Box
            component="img"
            className="home-flyer-image"
            src="/home/bect-flyer-readable.png"
            alt="BECT regional impact flyer with key figures, certifications, core competencies, clients, partners, and project locations"
            loading="lazy"
          />
        </Box>
      </Container>
    </Box>
  );
}

export default HomeFlyerSection;
