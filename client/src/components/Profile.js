import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  IconButton,
  Grid,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import CakeIcon from "@mui/icons-material/Cake";
import WcIcon from "@mui/icons-material/Wc";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ForumIcon from "@mui/icons-material/Forum";
import { getUsers } from "../api/api";
import moment from "moment";
import "./style.css";

const getAvatarUrl = (avatar) => {
  if (!avatar) return "";
  const isPredefined = /^[1-6]$/.test(avatar.toString());
  if (isPredefined) {
    return `https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava${avatar}-bg.webp`;
  }
  const baseUrl = process.env.REACT_APP_CHAT_BASE_URL || "http://localhost:5001";
  return `${baseUrl}/uploads/${avatar}`;
};

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const users = await getUsers();
        const foundUser = users.find((u) => u._id === id);
        setUser(foundUser);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress sx={{ color: '#00d2ff' }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: '#fff' }}>
        <Typography variant="h5">User not found</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2, color: '#00d2ff' }}>Go Back</Button>
      </Box>
    );
  }

  const infoItems = [
    { icon: <EmailIcon sx={{ color: '#00d2ff' }} />, label: "Username", value: `@${user.username}` },
    { icon: <WcIcon sx={{ color: '#00d2ff' }} />, label: "Gender", value: user.gender },
    { icon: <CakeIcon sx={{ color: '#00d2ff' }} />, label: "Age", value: `${user.age} years old` },
    { icon: <CalendarTodayIcon sx={{ color: '#00d2ff' }} />, label: "Joined", value: moment(user.createdAt).format("MMMM YYYY") },
  ];

  const currentUserId = localStorage.getItem("userId");

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ color: '#fff', mb: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Paper 
          elevation={0} 
          className="fade-in"
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 8,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
            color: "#fff",
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative background glow */}
          <Box sx={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(0, 210, 255, 0.1) 0%, transparent 70%)',
            zIndex: 0
          }} />

          <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                src={getAvatarUrl(user.avatar)}
                sx={{ 
                  width: 180, 
                  height: 180, 
                  border: '4px solid #00d2ff',
                  boxShadow: '0 0 30px rgba(0, 210, 255, 0.3)'
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(45deg, #00d2ff, #9d50bb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, fontWeight: 400 }}>
                  Active Nexus Member
                </Typography>
                {user._id !== currentUserId && (
                  <Button
                    variant="contained"
                    startIcon={<ForumIcon />}
                    onClick={() => navigate('/chat', { state: { selectUserId: user._id } })}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #00d2ff, #3a7bd5)',
                      boxShadow: '0 10px 20px rgba(0, 210, 255, 0.2)',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 15px 30px rgba(0, 210, 255, 0.3)' }
                    }}
                  >
                    Send Message
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.1)' }} />

          <Grid container spacing={4}>
            {infoItems.map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(0, 210, 255, 0.1)', display: 'flex' }}>
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default Profile;
