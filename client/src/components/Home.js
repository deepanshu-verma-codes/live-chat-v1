import { useState, useEffect } from "react";
import { Typography, Container, Box, Paper, Button, Grid, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ForumIcon from '@mui/icons-material/Forum';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import DevicesIcon from '@mui/icons-material/Devices';
import { getUsers } from "../api/api";
import "./style.css";

function Home() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (token && userId) {
      const fetchUser = async () => {
        try {
          const response = await getUsers();
          const currentUser = response.find((u) => u._id === userId);
          setUser(currentUser);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };
      fetchUser();
    }
  }, [token, userId]);

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#00d2ff' }} />,
      title: "Private & Secure",
      description: "Made for friends to chat between them without worrying. Your privacy is our priority."
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#9d50bb' }} />,
      title: "Real-time Speed",
      description: "Experience lightning-fast messaging. Connect with your friends instantly, anytime."
    },
    {
      icon: <ForumIcon sx={{ fontSize: 40, color: '#00d2ff' }} />,
      title: "Simple Interface",
      description: "A clean, minimalist design focused on what matters most: your conversations."
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 40, color: '#9d50bb' }} />,
      title: "Always Connected",
      description: "Seamlessly stay in touch. Your messages are always right where you left them."
    }
  ];

  return (
    <Box sx={{ pb: 10, color: '#fff' }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }} className="fade-in">
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 900,
                  fontSize: { xs: '3rem', md: '4.5rem' },
                  lineHeight: 1.1,
                  mb: 3,
                  background: 'linear-gradient(45deg, #00d2ff 30%, #9d50bb 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Connect with <br /> Friends, Worry-Free.
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ mb: 5, fontWeight: 400, maxWidth: '600px', mx: { xs: 'auto', md: 0 }, color: 'rgba(255,255,255,0.7)' }}
              >
                Nexus is the minimalist hub designed for friends to stay connected in a secure, private, and beautiful environment.
              </Typography>
              
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent={{ xs: 'center', md: 'flex-start' }}
              >
                {user ? (
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/chat"
                    size="large"
                    startIcon={<ForumIcon />}
                    sx={{ 
                      borderRadius: 4, px: 6, py: 2, textTransform: 'none', fontSize: '1.1rem', fontWeight: 600,
                      background: 'linear-gradient(45deg, #00d2ff 30%, #9d50bb 90%)',
                      boxShadow: '0 10px 20px rgba(0, 210, 255, 0.3)',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 15px 30px rgba(0, 210, 255, 0.4)' }
                    }}
                  >
                    Back to Chat
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to="/signup"
                      size="large"
                      startIcon={<RocketLaunchIcon />}
                      sx={{ 
                        borderRadius: 4, px: 6, py: 2, textTransform: 'none', fontSize: '1.1rem', fontWeight: 600,
                        background: 'linear-gradient(45deg, #00d2ff 30%, #9d50bb 90%)',
                        boxShadow: '0 10px 20px rgba(0, 210, 255, 0.3)',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 15px 30px rgba(0, 210, 255, 0.4)' }
                      }}
                    >
                      Join Nexus
                    </Button>
                    <Button 
                      variant="outlined" 
                      component={Link} 
                      to="/login"
                      size="large"
                      sx={{ 
                        borderRadius: 4, px: 6, py: 2, textTransform: 'none', fontSize: '1.1rem', fontWeight: 600,
                        borderColor: '#00d2ff', color: '#00d2ff', borderWidth: 2,
                        '&:hover': { borderWidth: 2, borderColor: '#fff', bgcolor: 'rgba(0, 210, 255, 0.1)', transform: 'translateY(-2px)', color: '#fff' }
                      }}
                    >
                      Login
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ position: 'relative' }} className="fade-in">
              <Paper elevation={0} sx={{
                p: 2,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 40px 80px rgba(0, 0, 0, 0.3)',
                transform: 'rotate(3deg)'
              }}>
                <Box sx={{ 
                  width: '100%', 
                  height: 350, 
                  borderRadius: 6, 
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ForumIcon sx={{ fontSize: 100, color: '#00d2ff', opacity: 0.5 }} />
                </Box>
              </Paper>
              {/* Decorative Blur */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '120%',
                height: '120%',
                background: 'radial-gradient(circle, rgba(0, 210, 255, 0.15) 0%, transparent 70%)',
                filter: 'blur(40px)',
                zIndex: -1,
                transform: 'translate(-50%, -50%)'
              }} />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', py: 12 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            textAlign="center" 
            sx={{ fontWeight: 800, mb: 8, background: 'linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.5) 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Why Choose Nexus?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4, 
                    height: '100%', 
                    borderRadius: 6,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s ease',
                    color: '#fff',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.07)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      borderColor: 'rgba(0, 210, 255, 0.3)'
                    }
                  }}
                >
                  <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Trust Section */}
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Paper elevation={0} sx={{
          p: { xs: 6, md: 10 },
          borderRadius: 8,
          background: 'linear-gradient(135deg, #00d2ff 0%, #9d50bb 100%)',
          color: 'white',
          boxShadow: '0 20px 50px rgba(0, 210, 255, 0.3)'
        }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>
            Ready to start?
          </Typography>
          <Typography variant="h6" sx={{ mb: 6, opacity: 0.9, fontWeight: 400 }}>
            Join thousands of friends who chat freely without compromise.
          </Typography>
          {!user && (
            <Button 
              variant="contained" 
              component={Link} 
              to="/signup"
              size="large"
              sx={{ 
                borderRadius: 4, px: 6, py: 2, textTransform: 'none', fontSize: '1.2rem', fontWeight: 700,
                backgroundColor: 'white', color: '#1a1a2e',
                '&:hover': { backgroundColor: '#f8faff', transform: 'scale(1.05)' }
              }}
            >
              Create Free Account
            </Button>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default Home;
