import React, { useState, useEffect } from 'react';
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
  useMediaQuery,
} from '@mui/material';
import { 
  Code as CodeIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Computer as ComputerIcon,
  Psychology as PsychologyIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { AuthModal } from '../components';
import { useAuth } from '../hooks';

// Create custom theme
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
  },  shape: {
    borderRadius: 20,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* Internet Explorer 10+ */
          '&::-webkit-scrollbar': {
            display: 'none',
            width: 0,
            height: 0,
          },
        },
        body: {
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* Internet Explorer 10+ */
          '&::-webkit-scrollbar': {
            display: 'none',
            width: 0,
            height: 0,
          },
        },
        '*': {
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* Internet Explorer 10+ */
          '&::-webkit-scrollbar': {
            display: 'none',
            width: 0,
            height: 0,
          },
        },
      },
    },
  },
});

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const codeFadeIn = keyframes`
  to {
    opacity: 1;
  }
`;

const iconFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const bgMove = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-20px, -20px) rotate(120deg); }
  66% { transform: translate(20px, -10px) rotate(240deg); }
`;

// Styled components
const GradientText = styled('span')(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
}));

const AnimatedBackground = styled(Box)({
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: -1,
  background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '200%',
    height: '200%',
    top: '-50%',
    left: '-50%',
    background: `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 40% 20%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)`,
    animation: `${bgMove} 20s ease-in-out infinite`,
  },
});

const Particle = styled('div')({
  position: 'absolute',
  width: '4px',
  height: '4px',
  background: 'rgba(99, 102, 241, 0.5)',
  borderRadius: '50%',
  animation: `${float} 15s infinite`,
});

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
  transform: 'perspective(1000px) rotateY(-5deg)',
  transition: 'transform 0.5s ease',
  border: '1px solid rgba(99, 102, 241, 0.3)',
  '&:hover': {
    transform: 'perspective(1000px) rotateY(0deg)',
  },
}));

const TechItem = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(99, 102, 241, 0.2)',
  borderRadius: 15,
  padding: '1.5rem 1rem',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
    background: 'rgba(99, 102, 241, 0.1)',
  },
}));

// Main component
export const LandingPage: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Handle "Get Started" button click
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setAuthModalTab('register');
      setAuthModalOpen(true);
    }
  };
  // Handle "Sign In" button click
  const handleSignIn = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setAuthModalTab('login');
      setAuthModalOpen(true);
    }
  };

  // Generate particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    delay: Math.random() * 15 + 's',
    duration: (15 + Math.random() * 10) + 's',
  }));

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

  const techStack = [
    { name: 'JavaScript', icon: '🟨' },
    { name: 'Python', icon: '🐍' },
    { name: 'Java', icon: '☕' },
    { name: 'PHP', icon: '🐘' },
    { name: 'React', icon: '⚛️' },
    { name: 'Ruby', icon: '💎' },
    { name: 'Rust', icon: '🦀' },
    { name: 'TypeScript', icon: '🔷' },
    { name: 'Go', icon: '🐹' },
    { name: 'C#', icon: '#️⃣' },
  ];

  const stats = [
    { number: '10K+', label: 'Active Learners' },
    { number: '500+', label: 'Expert Courses' },
    { number: '24/7', label: 'AI Support' },
    { number: '95%', label: 'Success Rate' },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', position: 'relative' }}>
        {/* Animated Background */}
        <AnimatedBackground>
          <Box sx={{ position: 'absolute', width: '100%', height: '100%' }}>
            {particles.map((particle) => (
              <Particle
                key={particle.id}
                sx={{
                  left: particle.left,
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                }}
              />
            ))}
          </Box>
        </AnimatedBackground>        {/* Hero Section */}
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            pt: 10,
            px: { xs: 2, md: 5 },
          }}
        >
          <Container maxWidth="xl">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Fade in timeout={1000}>
                  <Box sx={{ animation: `${slideInLeft} 0.8s ease-out` }}>
                    <Typography variant="h1" color="white" gutterBottom>
                      Learn to Code with{' '}
                      <GradientText>AI-Powered</GradientText> Guidance
                    </Typography>
                    <Typography
                      variant="h5"
                      color="text.secondary"
                      paragraph
                      sx={{ mb: 4, lineHeight: 1.6 }}
                    >
                      Master programming languages through personalized courses, real-time AI assistance, 
                      and hands-on projects. Track your progress and build real-world skills.
                    </Typography>                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              </Grid>

              <Grid item xs={12} md={6}>
                <Fade in timeout={1500}>
                  <Box sx={{ animation: `${slideInRight} 0.8s ease-out 0.6s both` }}>
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
                      <Box sx={{ p: 3, fontFamily: 'Monaco, Menlo, monospace', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        <Box sx={{ opacity: 0, animation: `${codeFadeIn} 0.5s ease-out 0.1s forwards` }}>
                          <Box component="span" sx={{ color: '#f97316' }}>const</Box>{' '}
                          <Box component="span" sx={{ color: '#06b6d4' }}>learnProgramming</Box> = () =&gt; {'{'}
                        </Box>
                        <Box sx={{ opacity: 0, animation: `${codeFadeIn} 0.5s ease-out 0.2s forwards`, pl: 2 }}>
                          <Box component="span" sx={{ color: '#64748b' }}>// AI-powered learning platform</Box>
                        </Box>
                        <Box sx={{ opacity: 0, animation: `${codeFadeIn} 0.5s ease-out 0.3s forwards`, pl: 2 }}>
                          <Box component="span" sx={{ color: '#f97316' }}>const</Box> skills = [
                          <Box component="span" sx={{ color: '#10b981' }}>'JavaScript'</Box>,{' '}
                          <Box component="span" sx={{ color: '#10b981' }}>'Python'</Box>,{' '}
                          <Box component="span" sx={{ color: '#10b981' }}>'React'</Box>];
                        </Box>
                        <Box sx={{ opacity: 0, animation: `${codeFadeIn} 0.5s ease-out 0.4s forwards`, pl: 2 }}>
                          <Box component="span" sx={{ color: '#f97316' }}>const</Box> features = {'{'}
                        </Box>
                        <Box sx={{ opacity: 0, animation: `${codeFadeIn} 0.5s ease-out 0.5s forwards`, pl: 4 }}>
                          aiTutor: <Box component="span" sx={{ color: '#10b981' }}>'24/7 assistance'</Box>,
                        </Box>
                        <Box sx={{ opacity: 0, animation: `${codeFadeIn} 0.5s ease-out 0.6s forwards`, pl: 4 }}>
                          projects: <Box component="span" sx={{ color: '#10b981' }}>'Real-world applications'</Box>,
                        </Box>
                        <Box sx={{ opacity: 0, animation: `${codeFadeIn} 0.5s ease-out 0.7s forwards`, pl: 4 }}>
                          tracking: <Box component="span" sx={{ color: '#10b981' }}>'Progress monitoring'</Box>
                        </Box>
                        <Box sx={{ opacity: 0, animation: `${codeFadeIn} 0.5s ease-out 0.8s forwards`, pl: 2 }}>
                          {'}'};
                        </Box>
                        <Box sx={{ opacity: 0, animation: `${codeFadeIn} 0.5s ease-out 0.9s forwards`, pl: 2 }}>
                          <Box component="span" sx={{ color: '#f97316' }}>return</Box>{' '}
                          <Box component="span" sx={{ color: '#06b6d4' }}>buildYourFuture</Box>(skills, features);
                        </Box>
                        <Box sx={{ opacity: 0, animation: `${codeFadeIn} 0.5s ease-out 1s forwards` }}>
                          {'}'};
                        </Box>
                      </Box>
                    </CodeEditor>
                  </Box>
                </Fade>
              </Grid>
            </Grid>
          </Container>
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

            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} lg={4} key={index}>
                  <Grow in timeout={1000 + index * 100}>
                    <FeatureCard>
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            width: 70,
                            height: 70,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            borderRadius: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            mb: 2,
                            animation: `${iconFloat} 3s ease-in-out infinite`,
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

        {/* Tech Stack Section */}
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

            <Grid container spacing={2}>
              {techStack.map((tech, index) => (
                <Grid item xs={6} sm={4} md={2.4} key={index}>
                  <Fade in timeout={1000 + index * 50}>
                    <TechItem elevation={0}>
                      <Typography fontSize="3rem" sx={{ mb: 0.5, filter: 'grayscale(1)', transition: 'filter 0.3s', '&:hover': { filter: 'grayscale(0)' } }}>
                        {tech.icon}
                      </Typography>
                      <Typography color="text.secondary" fontWeight={600}>
                        {tech.name}
                      </Typography>
                    </TechItem>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Stats Section */}
        <Box sx={{ py: 10, bgcolor: '#0a0a0a' }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
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
            </Typography>            <PrimaryButton 
              size="large"
              onClick={handleGetStarted}
            >
              {isAuthenticated ? 'Continue Learning' : 'Get Started for Free'}
            </PrimaryButton>
          </Container>
        </Box>        {/* Footer */}
        <Box
          sx={{
            py: 4,
            bgcolor: '#050505',
            borderTop: '1px solid rgba(99, 102, 241, 0.2)',
            textAlign: 'center',
          }}
        >
          <Typography color="text.secondary">
            © 2024 CodePath AI. All rights reserved. Built with ❤️ for learners worldwide.
          </Typography>
        </Box>

        {/* Auth Modal */}
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialTab={authModalTab}
        />
      </Box>
    </ThemeProvider>
  );
};
