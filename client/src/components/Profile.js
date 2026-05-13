import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Grid2,
  Divider,
  IconButton,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Cake as CakeIcon,
  Wc as WcIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import { getUsers } from "../api/api";
import "./style.css";

const getAvatarUrl = (avatar) => {
  if (!avatar) return "";
  const avatarStr = avatar.toString();
  if (avatarStr.startsWith("http")) return avatarStr;
  const isPredefined = /^[1-6]$/.test(avatarStr);
  if (isPredefined) {
    return `https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava${avatarStr}-bg.webp`;
  }
  const baseUrl = process.env.REACT_APP_CHAT_BASE_URL || "http://localhost:5001";
  return `${baseUrl}/uploads/${avatarStr}`;
};

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUsers();
        const foundUser = response.find((u) => u._id === id);
        if (foundUser) {
          setUser(foundUser);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress sx={{ color: "#00d2ff" }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" color="error" align="center">User not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 6 } }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.05)" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>User Profile</Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          borderRadius: 8,
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          position: "relative"
        }}
      >
        {/* Background Accent */}
        <Box sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(0, 210, 255, 0.1) 0%, transparent 70%)",
          zIndex: 0
        }} />

        <Grid2 container spacing={6} sx={{ position: "relative", zIndex: 1 }}>
          {/* Avatar Section */}
          <Grid2 size={{ xs: 12, md: 4 }} display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={getAvatarUrl(user.avatar)}
              alt={`${user.firstName}`}
              sx={{
                width: 180,
                height: 180,
                border: "4px solid rgba(0, 210, 255, 0.3)",
                boxShadow: "0 10px 30px rgba(0, 210, 255, 0.2)",
                mb: 3
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 800, textAlign: "center", color: "#fff" }}>
              {user.firstName}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, color: "rgba(255,255,255,0.5)", mb: 3 }}>
              @{user.username}
            </Typography>
            
            {currentUserId !== user._id && (
              <Button
                variant="contained"
                startIcon={<ChatIcon />}
                onClick={() => navigate("/chat", { state: { selectUserId: user._id } })}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 700,
                  background: "linear-gradient(45deg, #00d2ff 30%, #3a7bd5 90%)",
                  "&:hover": { transform: "scale(1.02)" }
                }}
              >
                Send Message
              </Button>
            )}
          </Grid2>

          {/* Details Section */}
          <Grid2 size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, color: "#fff", display: "flex", alignItems: "center", gap: 1.5 }}>
              <PersonIcon sx={{ color: "#00d2ff" }} /> Personal Information
            </Typography>
            
            <Grid2 container spacing={4}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 1 }}>
                    First Name
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>{user.firstName}</Typography>
                </Box>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 1 }}>
                    Last Name
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>{user.lastName}</Typography>
                </Box>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ bgcolor: "rgba(0, 210, 255, 0.1)", p: 1, borderRadius: 2 }}>
                    <WcIcon sx={{ color: "#00d2ff" }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 1 }}>
                      Gender
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>{user.gender}</Typography>
                  </Box>
                </Box>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ bgcolor: "rgba(157, 80, 187, 0.1)", p: 1, borderRadius: 2 }}>
                    <CakeIcon sx={{ color: "#9d50bb" }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 1 }}>
                      Age
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>{user.age} Years</Typography>
                  </Box>
                </Box>
              </Grid2>
            </Grid2>

            <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.05)" }} />
            
            <Box>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 1, mb: 1.5, display: "block" }}>
                Status
              </Typography>
              <Chip
                icon={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#44b700", ml: 1 }} />}
                label="Online"
                sx={{
                  bgcolor: "rgba(68, 183, 0, 0.1)",
                  color: "#44b700",
                  fontWeight: 700,
                  borderRadius: 2,
                  "& .MuiChip-label": { pl: 1 }
                }}
              />
            </Box>
          </Grid2>
        </Grid2>
      </Paper>
    </Container>
  );
}

export default Profile;
