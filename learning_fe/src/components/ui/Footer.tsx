import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Link,
  Divider,
  IconButton,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useApiConfig } from '../../hooks';

export const Footer: React.FC = () => {
  const { appName, appVersion, devMode, apiUrl } = useApiConfig();
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#050505',
        borderTop: 1,
        borderColor: 'divider',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'center', md: 'flex-start' }}
            spacing={3}
          >            {/* Logo and Description */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                CodePath AI
              </Typography>
              <Typography variant="body2" color="text.secondary" maxWidth={300}>
                Built with ❤️ for learners worldwide.
              </Typography>
              {devMode && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  v{appVersion} • API: {apiUrl}
                </Typography>
              )}
            </Box>

            {/* Links */}
            <Stack direction="row" spacing={4}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Product
                </Typography>
                <Stack spacing={1}>
                  <Link href="#" variant="body2" color="text.secondary">
                    Features
                  </Link>
                  <Link href="#" variant="body2" color="text.secondary">
                    Pricing
                  </Link>
                  <Link href="#" variant="body2" color="text.secondary">
                    Documentation
                  </Link>
                </Stack>
              </Stack>

              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Support
                </Typography>
                <Stack spacing={1}>
                  <Link href="#" variant="body2" color="text.secondary">
                    Help Center
                  </Link>
                  <Link href="#" variant="body2" color="text.secondary">
                    Contact Us
                  </Link>
                  <Link href="#" variant="body2" color="text.secondary">
                    Status
                  </Link>
                </Stack>
              </Stack>

              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Company
                </Typography>
                <Stack spacing={1}>
                  <Link href="#" variant="body2" color="text.secondary">
                    About
                  </Link>
                  <Link href="#" variant="body2" color="text.secondary">
                    Blog
                  </Link>
                  <Link href="#" variant="body2" color="text.secondary">
                    Careers
                  </Link>
                </Stack>
              </Stack>
            </Stack>

            {/* Social Links */}
            <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Connect
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" color="primary">
                  <GitHubIcon />
                </IconButton>
                <IconButton size="small" color="primary">
                  <LinkedInIcon />
                </IconButton>
                <IconButton size="small" color="primary">
                  <TwitterIcon />
                </IconButton>
                <IconButton size="small" color="primary">
                  <EmailIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>

          <Divider />

          {/* Bottom Section */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >            <Typography variant="body2" color="text.secondary">
             © {new Date().getFullYear()} CodePath AI. All rights reserved. 
            </Typography>
            <Stack direction="row" spacing={3}>
              <Link href="#" variant="body2" color="text.secondary">
                Privacy Policy
              </Link>
              <Link href="#" variant="body2" color="text.secondary">
                Terms of Service
              </Link>
              <Link href="#" variant="body2" color="text.secondary">
                Cookie Policy
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
