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
} from "@mui/material";
import {
  AccountCircle,
  Lock,
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
            borderRadius: 6,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff"
          }}
        >
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                background: "linear-gradient(45deg, #00d2ff, #9d50bb)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>
              Login to continue your conversations
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ff8a80' }}>
              {error}
            </Alert>
          )}

          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle sx={{ color: '#00d2ff' }} />
                  </InputAdornment>
                ),
                sx: { color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }
              }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
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
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#00d2ff' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }
              }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              startIcon={<LoginIcon />}
              sx={{
                mt: 4,
                mb: 3,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 700,
                borderRadius: 3,
                textTransform: "none",
                background: "linear-gradient(45deg, #00d2ff 30%, #9d50bb 90%)",
                boxShadow: "0 4px 15px rgba(0, 210, 255, 0.3)",
                "&:hover": {
                  background: "linear-gradient(45deg, #9d50bb 30%, #00d2ff 90%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(0, 210, 255, 0.4)",
                },
              }}
            >
              Login
            </Button>
            <Box textAlign="center">
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  style={{
                    color: "#00d2ff",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Sign Up
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
