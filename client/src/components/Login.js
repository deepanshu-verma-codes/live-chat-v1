import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { getUsers, login } from "../api/api";
import "./style.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      const { token, userId } = await login({ username, password });
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      const users = await getUsers();
      const currentUser = users.find((u) => u._id === userId);
      localStorage.setItem("user", JSON.stringify(currentUser));
      navigate("/chat");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed, please try again";
      setError(errorMessage);
      console.error("Login error:", errorMessage);
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const textFieldStyle = {
    color: '#fff',
    '& .MuiOutlinedInput-notchedOutline': { 
      borderColor: 'rgba(255,255,255,0.1)',
      borderRadius: '16px'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 210, 255, 0.4)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#00d2ff',
      boxShadow: '0 0 15px rgba(0, 210, 255, 0.2)'
    },
    '& .MuiInputBase-input': {
      padding: '16px 20px'
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          className="fade-in"
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 8,
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(30px)",
            boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#fff"
          }}
        >
          <Box sx={{ mb: 5, textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                mb: 1,
                letterSpacing: "-1.5px",
                background: "linear-gradient(45deg, #00d2ff, #9d50bb)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Nexus
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
              Welcome back to your network
            </Typography>
          </Box>

          {error && (
            <Fade in>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3, 
                  bgcolor: 'rgba(211, 47, 47, 0.05)', 
                  color: '#ff8a80',
                  border: '1px solid rgba(211, 47, 47, 0.2)'
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          <Box component="form" noValidate>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              required
              margin="normal"
              InputProps={{
                sx: textFieldStyle
              }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', ml: 1 } }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: 'rgba(255,255,255,0.2)' }}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: textFieldStyle
              }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', ml: 1 } }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              startIcon={<LoginIcon />}
              sx={{
                mt: 4,
                mb: 3,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 800,
                borderRadius: 4,
                textTransform: "none",
                background: "linear-gradient(45deg, #00d2ff 30%, #9d50bb 90%)",
                boxShadow: "0 10px 30px rgba(0, 210, 255, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(45deg, #9d50bb 30%, #00d2ff 90%)",
                  transform: "translateY(-3px)",
                  boxShadow: "0 15px 40px rgba(0, 210, 255, 0.5)",
                },
              }}
            >
              Access Account
            </Button>
            <Box textAlign="center">
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                New to Nexus?{" "}
                <Link
                  to="/signup"
                  style={{
                    color: "#00d2ff",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Join the Network
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
