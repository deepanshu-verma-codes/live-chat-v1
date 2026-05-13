import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation, Link } from "react-router-dom";
import {
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import ForumIcon from "@mui/icons-material/Forum";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatIcon from "@mui/icons-material/Chat";
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

function Layout() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token && userId) {
      const fetchUser = async () => {
        try {
          const response = await getUsers();
          const currentUser = response.find((u) => u._id === userId);
          setUser(currentUser);
        } catch (error) {
          console.error("Error fetching user:", error);
          handleLogout();
        }
      };
      fetchUser();
    } else {
      setUser(null);
    }
  }, [token, userId]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    handleMenuClose();
    navigate("/login");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        overflow: "hidden",
        color: "#fff"
      }}
    >
      {/* Top Bar */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          backgroundColor: "rgba(15, 12, 41, 0.7)", 
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 4 } }}>
          {/* Left Side: Logo + Name */}
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              textDecoration: "none", 
              color: "inherit",
              gap: 1.5
            }}
          >
            <Box sx={{ 
              background: "linear-gradient(45deg, #00d2ff, #9d50bb)", 
              borderRadius: "12px", 
              p: 0.8, 
              display: "flex",
              boxShadow: "0 4px 15px rgba(0, 210, 255, 0.3)"
            }}>
              <ForumIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.5px",
                background: "linear-gradient(45deg, #00d2ff 30%, #9d50bb 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Nexus
            </Typography>
          </Box>

          {/* Right Side: Auth Buttons or Profile */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {user ? (
              <>
                {location.pathname !== "/chat" && (
                  <Button
                    component={Link}
                    to="/chat"
                    startIcon={<ChatIcon />}
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                      mr: 1,
                      color: "#fff",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.1)",
                      }
                    }}
                  >
                    Chat
                  </Button>
                )}
                
                <Tooltip title="Profile">
                  <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                    <Avatar
                      src={getAvatarUrl(user.avatar)}
                      alt={`${user.firstName}`}
                      sx={{ width: 40, height: 40, border: "2px solid #00d2ff" }}
                    />
                  </IconButton>
                </Tooltip>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      borderRadius: "16px",
                      background: "rgba(36, 36, 62, 0.95)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                      minWidth: 180,
                      color: "#fff",
                      "& .MuiMenuItem-root": {
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.05)",
                        }
                      }
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user.firstName} {user.lastName}</Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>Online</Typography>
                  </Box>
                  {location.pathname !== "/chat" && (
                    <MenuItem onClick={() => navigate("/chat")}>
                      <ListItemIcon><ChatIcon fontSize="small" sx={{ color: "#00d2ff" }} /></ListItemIcon>
                      Chat
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout} sx={{ color: "#ff4b2b" }}>
                    <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: "#ff4b2b" }} /></ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  component={Link} 
                  to="/login"
                  sx={{ 
                    color: "rgba(255,255,255,0.7)", 
                    textTransform: "none", 
                    fontWeight: 600,
                    px: 3,
                    "&:hover": { color: "#fff" }
                  }}
                >
                  Login
                </Button>
                <Button 
                  component={Link} 
                  to="/signup"
                  variant="contained"
                  sx={{ 
                    borderRadius: "10px", 
                    textTransform: "none", 
                    fontWeight: 600,
                    px: 3,
                    background: "linear-gradient(45deg, #00d2ff 30%, #9d50bb 90%)",
                    boxShadow: "0 4px 15px rgba(0, 210, 255, 0.3)",
                    "&:hover": {
                      boxShadow: "0 6px 20px rgba(0, 210, 255, 0.4)",
                      transform: "translateY(-1px)"
                    }
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, height: "calc(100vh - 64px)", overflow: "auto" }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
