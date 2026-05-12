import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Grid2,
  Box,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
  Badge as BadgeIcon,
  Cake as CakeIcon,
  Wc as WcIcon,
  PersonAdd as PersonAddIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { signup, getUsers } from "../api/api";
import "./style.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const isFormComplete =
    username && password && firstName && lastName && gender && age && (avatar || selectedFile);

  const validateUsername = (username) => {
    const minLength = 4;
    const hasNumber = /\d/.test(username);
    return username.length >= minLength && hasNumber;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setAvatar(null); // Clear predefined avatar if file is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSignup = async () => {
    setError("");
    if (!validateUsername(username)) {
      setError(
        "Username must be at least 4 characters long and contain at least one number"
      );
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("gender", gender);
    formData.append("age", age);
    
    if (selectedFile) {
      formData.append("image", selectedFile);
    } else if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      const { token, userId } = await signup(formData);
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      const users = await getUsers();
      const currentUser = users.find((u) => u._id === userId);
      localStorage.setItem("user", JSON.stringify(currentUser));
      navigate("/chat");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Signup failed, please try again";
      setError(errorMessage);
      console.error("Signup error:", errorMessage);
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
              Join Nexus
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>
              Create your account and start connecting
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ff8a80' }}>
              {error}
            </Alert>
          )}

          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                variant="outlined"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon sx={{ color: '#00d2ff' }} />
                    </InputAdornment>
                  ),
                  sx: { color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }
                }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                variant="outlined"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon sx={{ color: '#00d2ff' }} />
                    </InputAdornment>
                  ),
                  sx: { color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }
                }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Username"
                placeholder="e.g., john123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
                required
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
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                required
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
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                variant="outlined"
                required
                inputProps={{ min: 13 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CakeIcon sx={{ color: '#00d2ff' }} />
                    </InputAdornment>
                  ),
                  sx: { color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }
                }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <FormControl component="fieldset" required fullWidth>
                <FormLabel
                  component="legend"
                  sx={{
                    fontSize: "0.85rem",
                    mb: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: 'rgba(255,255,255,0.6)'
                  }}
                >
                  <WcIcon fontSize="small" sx={{ color: '#00d2ff' }} /> Gender
                </FormLabel>
                <RadioGroup
                  row
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <FormControlLabel
                    value="Male"
                    control={<Radio size="small" sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#00d2ff' } }} />}
                    label={<Typography variant="body2">Male</Typography>}
                  />
                  <FormControlLabel
                    value="Female"
                    control={<Radio size="small" sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#00d2ff' } }} />}
                    label={<Typography variant="body2">Female</Typography>}
                  />
                </RadioGroup>
              </FormControl>
            </Grid2>

            <Grid2 size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 600, color: "#fff", mb: 2 }}
              >
                Profile Picture
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: "none",
                      borderColor: selectedFile ? "#4caf50" : "#00d2ff",
                      color: selectedFile ? "#4caf50" : "#00d2ff",
                      "&:hover": {
                        borderColor: selectedFile ? "#388e3c" : "#fff",
                        bgcolor: "rgba(0, 210, 255, 0.1)"
                      }
                    }}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </Button>
                  
                  {previewUrl && (
                    <Box sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={previewUrl}
                        alt="Preview"
                        sx={{
                          width: 65,
                          height: 65,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "3px solid #4caf50",
                          boxShadow: "0 0 15px rgba(76, 175, 80, 0.4)"
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={clearSelectedFile}
                        sx={{
                          position: "absolute",
                          top: -5,
                          right: -5,
                          bgcolor: "#f44336",
                          color: "white",
                          "&:hover": { bgcolor: "#d32f2f" }
                        }}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                
                <Divider sx={{ mb: 2, '&::before, &::after': { borderColor: 'rgba(255,255,255,0.1)' } }}>
                  <Typography variant="caption" color="rgba(255,255,255,0.4)">OR CHOOSE AN AVATAR</Typography>
                </Divider>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  sx={{ gap: 2, opacity: selectedFile ? 0.5 : 1, pointerEvents: selectedFile ? "none" : "auto" }}
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <Tooltip title={`Avatar ${num}`} key={num}>
                      <Box
                        component="img"
                        src={`https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava${num}-bg.webp`}
                        alt={`Avatar ${num}`}
                        onClick={() => {
                          setAvatar(num);
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        sx={{
                          width: { xs: 55, sm: 65 },
                          height: { xs: 55, sm: 65 },
                          borderRadius: "50%",
                          cursor: "pointer",
                          border:
                            avatar === num
                              ? "4px solid #00d2ff"
                              : "2px solid transparent",
                          boxShadow:
                            avatar === num
                              ? "0 0 15px rgba(0, 210, 255, 0.5)"
                              : "0 2px 8px rgba(0,0,0,0.1)",
                          transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          "&:hover": {
                            transform: "scale(1.15)",
                            boxShadow: "0 5px 15px rgba(0,0,0,0.4)",
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            </Grid2>

            <Grid2 size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSignup}
                disabled={!isFormComplete}
                startIcon={<PersonAddIcon />}
                sx={{
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  borderRadius: 3,
                  textTransform: "none",
                  background: isFormComplete
                    ? "linear-gradient(45deg, #00d2ff 30%, #9d50bb 90%)"
                    : "rgba(255,255,255,0.05)",
                  boxShadow: isFormComplete
                    ? "0 4px 15px rgba(0, 210, 255, 0.3)"
                    : "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(45deg, #9d50bb 30%, #00d2ff 90%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(0, 210, 255, 0.4)",
                  },
                }}
              >
                Sign Up
              </Button>
            </Grid2>

            <Grid2 size={{ xs: 12 }} textAlign="center" sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#00d2ff",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Log In
                </Link>
              </Typography>
            </Grid2>
          </Grid2>
        </Paper>
      </Container>
    </Box>
  );
}

export default Signup;
