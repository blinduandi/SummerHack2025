import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Stack,
  Paper,
  Fade,
  Grow,
  styled,
  keyframes,
} from '@mui/material';
import { Code as CodeIcon } from '@mui/icons-material'; // Make sure CodeIcon is imported
import { AuthModal } from '../components';
import { useAuth } from '../hooks';
import Aurora from '../blocks/Aurora/Aurora';

// Create custom theme (remains the same)
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
    },
    background: {
      default: '#050505',
      paper: '#0a0a0a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    h1: {
      fontWeight: 900,
      fontSize: 'clamp(3rem, 6vw, 5rem)',
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 800,
      fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
    },
  },
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'none', /* Firefox */
          '&::-webkit-scrollbar': {
            display: 'none', /* Safari and Chrome */
          },
        },
      },
    },
  },
});


// ... (Animations and other styled components remain the same) ...

const infiniteScroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const GradientText = styled('span')(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  padding: '12px 32px',
  borderRadius: 50,
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.3)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
    '&:before': {
      left: '100%',
    },
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  color: 'white',
  padding: '12px 32px',
  borderRadius: 50,
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  transition: 'transform 0.3s ease, background 0.3s ease, border-color 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'white',
    transform: 'translateY(-2px)',
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(99, 102, 241, 0.2)',
  borderRadius: 20,
  padding: '1rem',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-10px)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
    '&:before': {
      opacity: 1,
    },
  },
}));

const CodeEditor = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.9)',
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(99, 102, 241, 0.3)',
  width: '100%',
  maxWidth: '700px',
}));

const CarouselContainer = styled(Box)({
  width: '100%',
  overflow: 'hidden',
  padding: '2rem 0',
  position: 'relative',
  '&:before, &:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '10rem',
    zIndex: 2,
  },
  '&:before': {
    left: 0,
    background: 'linear-gradient(to right, #050505 0%, transparent 100%)',
  },
  '&:after': {
    right: 0,
    background: 'linear-gradient(to left, #050505 0%, transparent 100%)',
  },
});

const CarouselTrack = styled(Box)({
  display: 'flex',
  width: 'calc(200% + 4rem)', // Adjust width based on number of items and margin
  animation: `${infiniteScroll} 40s linear infinite`,
  '&:hover': {
    animationPlayState: 'paused',
  },
});

const TechItem = styled(Paper)(({ theme }) => ({
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: 15,
    padding: '1.5rem 1rem',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    flexShrink: 0,
    width: '160px',
    margin: '0 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '180px', // Ensure all cards have the same height
  '&:hover': {
    transform: 'translateY(-5px)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
    background: 'rgba(99, 102, 241, 0.1)',
  },
}));

const iconFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

/**
 * A component to display a technology icon with a fallback.
 * It uses React state to handle image loading errors, which is a
 * cleaner approach than direct DOM manipulation.
 */
const TechIcon: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return <CodeIcon sx={{ width: 60, height: 60, mb: 2, color: 'text.secondary' }} />;
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: 60,
        height: 60,
        objectFit: 'contain',
        mb: 2,
        filter: 'grayscale(100%)',
        transition: 'filter 0.3s ease-in-out',
        '&:hover': {
          filter: 'grayscale(0%)',
        },
      }}
      onError={handleError}
    />
  );
};


// Main component
export const LandingPage: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setAuthModalTab('register');
      setAuthModalOpen(true);
    }
  };

  const features = [
    {
        icon: '🤖',
        title: 'AI-Powered Assistant',
        description: 'Get instant help from our intelligent AI tutor that understands your code and provides personalized guidance 24/7.',
    },
    {
        icon: '📚',
        title: 'Structured Learning Paths',
        description: 'Follow expertly crafted courses organized into programs, courses, and step-by-step lessons for optimal learning.',
    },
    {
        icon: '📊',
        title: 'Progress Tracking',
        description: 'Monitor your learning journey with detailed analytics, achievements, and personalized recommendations.',
    },
    {
        icon: '💻',
        title: 'Hands-On Projects',
        description: 'Build real-world applications with integrated Git repositories and practical exercises for each course.',
    },
    {
        icon: '🎯',
        title: 'Personalized Learning',
        description: 'Receive AI-powered course recommendations based on your progress, interests, and learning style.',
    },
    {
        icon: '👥',
        title: 'Dual Platform',
        description: "Whether you're a student learning or a teacher creating courses, our platform adapts to your needs.",
    },
  ];

  // UPDATED: techStack now uses image asset paths
  const techStack = [
    { name: 'JavaScript', icon: '/assets/js-icon.svg' },
    { name: 'Python', icon: '/assets/python-icon.svg' },
    { name: 'Java', icon: '/assets/java-icon.png' },
    { name: 'PHP', icon: '/assets/php-icon.png' },
    { name: 'React', icon: '/assets/react-icon.png' },
    { name: 'Ruby', icon: '/assets/ruby-icon.png' },
    { name: 'Rust', icon: '/assets/rust-icon.png' },
    { name: 'TypeScript', icon: '/assets/ts-icon.png' },
    { name: 'Go', icon: '/assets/go-icon.png' },
    { name: 'C#', icon: '/assets/csharp-icon.png' },
  ];

  const extendedTechStack = [...techStack, ...techStack];

  const stats = [
    { number: '10K+', label: 'Active Learners' },
    { number: '500+', label: 'Expert Courses' },
    { number: '24/7', label: 'AI Support' },
    { number: '95%', label: 'Success Rate' },
  ];

  const auroraColorStops = useMemo(() => [
    darkTheme.palette.primary.main,
    darkTheme.palette.secondary.main,
    darkTheme.palette.primary.dark,
  ], []);


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

        <Box
          sx={{
            position: 'fixed',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        >
          <Aurora
            colorStops={auroraColorStops}
            blend={6}
            speed={1.5}
            amplitude={0.5}
          />
        </Box>

        {/* Hero Section */}
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pt: 15,
            pb: 10,
            px: { xs: 2, md: 5 },
          }}
        >
          <Fade in timeout={1000}>
            <Box>
              <Typography variant="h1" color="white" gutterBottom>
                Learn to Code with{' '}
                <GradientText>AI-Powered</GradientText> Guidance
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                paragraph
                sx={{ mb: 4, lineHeight: 1.6, maxWidth: '800px', mx: 'auto' }}
              >
                Master programming languages through personalized courses, real-time AI assistance,
                and hands-on projects. Track your progress and build real-world skills.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 6 }}>
                <PrimaryButton
                  size="large"
                  onClick={handleGetStarted}
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Learning Free'}
                </PrimaryButton>
                <SecondaryButton size="large">View Demo</SecondaryButton>
              </Stack>
            </Box>
          </Fade>

          <Fade in timeout={1500}>
            <CodeEditor elevation={10}>
              <Box
                sx={{
                  bgcolor: 'rgba(30, 41, 59, 0.9)',
                  p: 1.5,
                  display: 'flex',
                  gap: 1,
                }}
              >
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f57' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
              </Box>
              <Box sx={{ p: {xs: 2, md: 3}, fontFamily: 'Monaco, Menlo, monospace', fontSize: '0.9rem', lineHeight: 1.6, textAlign: 'left' }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  <code>
                    <Box component="span" sx={{ color: '#f97316' }}>const</Box>{' '}
                    <Box component="span" sx={{ color: '#06b6d4' }}>learnProgramming</Box> = () =&gt; {'{\n'}
                    {'  '}<Box component="span" sx={{ color: '#64748b' }}>// AI-powered learning platform</Box>{'\n'}
                    {'  '}<Box component="span" sx={{ color: '#f97316' }}>const</Box> skills = [<Box component="span" sx={{ color: '#10b981' }}>'JavaScript'</Box>, <Box component="span" sx={{ color: '#10b981' }}>'Python'</Box>, <Box component="span" sx={{ color: '#10b981' }}>'React'</Box>];{'\n'}
                    {'  '}<Box component="span" sx={{ color: '#f97316' }}>const</Box> features = {'{\n'}
                    {'    '}aiTutor: <Box component="span" sx={{ color: '#10b981' }}>'24/7 assistance'</Box>,{'\n'}
                    {'    '}projects: <Box component="span" sx={{ color: '#10b981' }}>'Real-world applications'</Box>,{'\n'}
                    {'    '}tracking: <Box component="span" sx={{ color: '#10b981' }}>'Progress monitoring'</Box>{'\n'}
                    {'  '}{'}'};{'\n'}
                    {'  '}<Box component="span" sx={{ color: '#f97316' }}>return</Box> <Box component="span" sx={{ color: '#06b6d4' }}>buildYourFuture</Box>(skills, features);{'\n'}
                    {'}'};
                  </code>
                </pre>
              </Box>
            </CodeEditor>
          </Fade>
        </Box>


        {/* Features Section */}
        <Box sx={{ py: 10, bgcolor: '#0a0a0a' }}>
          <Container maxWidth="xl">
            <Box textAlign="center" mb={6}>
              <Typography variant="h2" color="white" gutterBottom>
                Why Choose <GradientText>CodePath AI</GradientText>
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
                Experience the future of programming education with our cutting-edge features
              </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
              {features.map((feature, index) => (
                <Grid item xs={12} sm={8} md={6} key={index}>
                  <Grow in timeout={1000 + index * 100}>
                    <FeatureCard>
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            width: 70, height: 70,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', mb: 2,
                            animation: `${iconFloat} 3s ease-in-out infinite`,
                            animationDelay: `${index * 0.2}s`,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h5" color="white" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </FeatureCard>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Tech Stack Section with Image Icons */}
        <Box sx={{ py: 10, bgcolor: '#050505' }}>
          <Container maxWidth="xl">
            <Box textAlign="center" mb={6}>
              <Typography variant="h2" color="white" gutterBottom>
                Master <GradientText>Popular Technologies</GradientText>
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Learn the most in-demand programming languages and frameworks
              </Typography>
            </Box>
          </Container>
          <CarouselContainer>
              <CarouselTrack>
                {extendedTechStack.map((tech, index) => (
                    <TechItem key={index} elevation={0}>
                      <TechIcon src={tech.icon} alt={tech.name} />
                      <Typography color="text.secondary" fontWeight={600}>
                        {tech.name}
                      </Typography>
                    </TechItem>
                ))}
              </CarouselTrack>
          </CarouselContainer>
        </Box>

        {/* Stats Section */}
        <Box sx={{ py: 10, bgcolor: '#0a0a0a' }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} justifyContent="center">
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Fade in timeout={1000 + index * 100}>
                    <Box textAlign="center">
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 900,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 1,
                        }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: 10,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h2" color="white" gutterBottom>
              Ready to Start Your <GradientText>Coding Journey?</GradientText>
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
              Join thousands of learners mastering programming with AI-powered guidance
            </Typography>
            <PrimaryButton
              size="large"
              onClick={handleGetStarted}
            >
              {isAuthenticated ? 'Continue Learning' : 'Get Started for Free'}
            </PrimaryButton>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            py: 4,
            bgcolor: '#050505',
            borderTop: '1px solid rgba(99, 102, 241, 0.2)',
            textAlign: 'center',
          }}
        >
          <Typography color="text.secondary">
            © {new Date().getFullYear()} CodePath AI. All rights reserved. Built with ❤️ for learners worldwide.
          </Typography>
        </Box>

        {/* Auth Modal */}
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialTab={authModalTab}
        />
      </Box>\
    </ThemeProvider>
  );
};