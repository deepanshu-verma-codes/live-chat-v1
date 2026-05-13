import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid2,
  Box,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
  CircularProgress,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  CheckCircle as CheckCircleIcon,
  Nature as NatureIcon,
  Face as FaceIcon,
  Check as CheckIcon,
  ErrorOutline as ErrorIcon,
} from "@mui/icons-material";
import { signup, getUsers, checkUsername } from "../api/api";
import "./style.css";

const NATURE_SEEDS = ["Eden", "Andrea", "Liam", "Sophia", "Ryker"];
const MALE_SEEDS = ["Mason", "Eden", "Adrian", "Kingston", "Christopher", "Leo", "Alexander", "Wyatt", "George", "Arthur"];
const FEMALE_SEEDS = ["Ryker", "Emery", "Mason", "Jessica", "Christopher", "Adrian", "Sawyer", "Jude", "Katherine", "Valentina"];

const getDiceBearUrl = (style, seed) => {
  const baseUrl = process.env.REACT_APP_DICEBEAR_BASE_URL || "https://api.dicebear.com/9.x";
  return `${baseUrl}/${style}/svg?seed=${seed}`;
};

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
  
  // Username check states
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // 'available', 'taken', or null
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Debouncing for Username Check
  useEffect(() => {
    if (username.length < 4) {
        setUsernameStatus(null);
        setSuggestions([]);
        return;
    }

    const timer = setTimeout(async () => {
        setIsCheckingUsername(true);
        try {
            const { available } = await checkUsername(username);
            setUsernameStatus(available ? 'available' : 'taken');
            
            if (!available) {
                // Generate suggestions
                const base = username.replace(/\d+$/, "");
                const newSuggestions = [
                    `${base}${Math.floor(Math.random() * 999)}`,
                    `${base}_${Math.floor(Math.random() * 99)}`,
                    `${base}Nexus`,
                    `${base}Chat`
                ].slice(0, 3);
                setSuggestions(newSuggestions);
            } else {
                setSuggestions([]);
            }
        } catch (err) {
            console.error("Username check error", err);
        } finally {
            setIsCheckingUsername(false);
        }
    }, 600); // 600ms delay

    return () => clearTimeout(timer);
  }, [username]);

  const natureAvatars = useMemo(() => 
    NATURE_SEEDS.map(s => ({ seed: s, url: getDiceBearUrl("lorelei", s), type: 'nature' })), 
  []);

  const genderAvatars = useMemo(() => {
    if (gender === "Male") {
        return MALE_SEEDS.map(s => ({ seed: s, url: getDiceBearUrl("avataaars", s), type: 'gender' }));
    }
    if (gender === "Female") {
        return FEMALE_SEEDS.map(s => ({ seed: s, url: getDiceBearUrl("adventurer", s), type: 'gender' }));
    }
    return [];
  }, [gender]);

  const isFormComplete =
    username && 
    usernameStatus === 'available' &&
    password && 
    firstName && 
    lastName && 
    gender && 
    age && 
    (avatar || selectedFile);

  const validateUsername = (username) => {
    const minLength = 4;
    const hasNumber = /\d/.test(username);
    return username && username.length >= minLength && hasNumber;
  };

  const handleGenderChange = (event, newGender) => {
    if (newGender !== null) {
      setGender(newGender);
      
      // If the currently selected avatar is gender-specific and the gender changed, clear it
      if (avatar && !avatar.startsWith("data:")) {
          const isNature = natureAvatars.some(a => a.url === avatar);
          if (!isNature) {
              setAvatar(null);
          }
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setAvatar(null);
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

  const handleAgeChange = (e) => {
    const value = e.target.value;
    // Strictly allow only digits and prevent non-numeric entry
    if (/^\d*$/.test(value)) {
        setAge(value);
    }
  };

  const handleSignup = async () => {
    setError("");
    if (!validateUsername(username)) {
      setError("Username must be at least 4 characters long and contain at least one number");
      return;
    }

    if (usernameStatus !== 'available') {
        setError("Please choose an available username");
        return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 70) {
        setError("Age must be between 18 and 70");
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
      setError(error.response?.data?.message || "Signup failed, please try again");
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const avatarBoxStyle = (url) => ({
    width: { xs: 60, sm: 70 },
    height: { xs: 60, sm: 70 },
    borderRadius: "20px",
    cursor: "pointer",
    bgcolor: "rgba(255,255,255,0.03)",
    border: avatar === url ? "3px solid #00d2ff" : "2px solid rgba(255,255,255,0.1)",
    position: "relative",
    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    overflow: "hidden",
    "&:hover": {
      transform: "scale(1.1) translateY(-5px)",
      borderColor: "rgba(0, 210, 255, 0.5)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.3)"
    }
  });

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
    <Box sx={{ 
      minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", py: 4 
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} className="fade-in" sx={{
          p: { xs: 3, md: 5 }, borderRadius: 8, background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(30px)", boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.08)", color: "#fff"
        }}>
          <Box sx={{ mb: 5, textAlign: "center" }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 900, mb: 1, letterSpacing: "-1.5px",
              background: "linear-gradient(45deg, #00d2ff, #9d50bb)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              Nexus
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
              Create an account to join the network
            </Typography>
          </Box>

          {error && <Fade in><Alert severity="error" sx={{ mb: 3, borderRadius: 3, bgcolor: 'rgba(211, 47, 47, 0.05)', color: '#ff8a80', border: '1px solid rgba(211, 47, 47, 0.2)' }}>{error}</Alert></Fade>}

          <Grid2 container spacing={2.5}>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                InputProps={{ sx: textFieldStyle }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', ml: 1 } }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)}
                InputProps={{ sx: textFieldStyle }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', ml: 1 } }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField 
                fullWidth 
                label="Username" 
                placeholder="e.g., alex_dev" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{ 
                    sx: textFieldStyle,
                    endAdornment: (
                        <InputAdornment position="end">
                            {isCheckingUsername && <CircularProgress size={20} sx={{ color: '#00d2ff' }} />}
                            {!isCheckingUsername && usernameStatus === 'available' && <CheckIcon sx={{ color: '#4caf50' }} />}
                            {!isCheckingUsername && usernameStatus === 'taken' && <ErrorIcon sx={{ color: '#f44336' }} />}
                        </InputAdornment>
                    )
                }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', ml: 1 } }}
                helperText={
                    usernameStatus === 'taken' ? (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" sx={{ color: '#f44336', display: 'block', mb: 1 }}>
                                Username taken. Try these:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {suggestions.map(s => (
                                    <Chip 
                                        key={s} 
                                        label={s} 
                                        size="small" 
                                        onClick={() => setUsername(s)}
                                        sx={{ 
                                            bgcolor: 'rgba(0, 210, 255, 0.1)', 
                                            color: '#00d2ff', 
                                            border: '1px solid rgba(0, 210, 255, 0.3)',
                                            '&:hover': { bgcolor: 'rgba(0, 210, 255, 0.2)' }
                                        }} 
                                    />
                                ))}
                            </Box>
                        </Box>
                    ) : username.length > 0 && username.length < 4 ? (
                        "Min 4 characters required"
                    ) : null
                }
                FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.4)' } }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField fullWidth label="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                InputProps={{ 
                  endAdornment: <InputAdornment position="end"><IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: 'rgba(255,255,255,0.2)' }}>{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>,
                  sx: textFieldStyle 
                }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', ml: 1 } }}
              />
            </Grid2>
            
            <Grid2 size={{ xs: 12, sm: 5 }}>
              <TextField 
                fullWidth 
                label="Age" 
                value={age} 
                onChange={handleAgeChange}
                inputProps={{ 
                    min: 18, 
                    max: 70,
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                }}
                InputProps={{ sx: textFieldStyle }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', ml: 1 } }}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 7 }}>
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <ToggleButtonGroup
                  value={gender}
                  exclusive
                  onChange={handleGenderChange}
                  fullWidth
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
                    '& .MuiToggleButton-root': {
                      border: 'none', color: 'rgba(255,255,255,0.4)', textTransform: 'none', py: 1.5, borderRadius: '14px', m: '4px',
                      '&.Mui-selected': { 
                        bgcolor: 'rgba(0, 210, 255, 0.15)', color: '#00d2ff', fontWeight: 700,
                        '&:hover': { bgcolor: 'rgba(0, 210, 255, 0.2)' }
                      },
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' }
                    }
                  }}
                >
                  <ToggleButton value="Male"><MaleIcon sx={{ mr: 1, fontSize: 20 }} /> Male</ToggleButton>
                  <ToggleButton value="Female"><FemaleIcon sx={{ mr: 1, fontSize: 20 }} /> Female</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid2>

            <Grid2 size={{ xs: 12 }}>
              <Box sx={{ mt: 2, p: 3, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="subtitle2" sx={{ mb: 2.5, fontWeight: 700, color: "rgba(255,255,255,0.6)", display: 'flex', alignItems: 'center', gap: 1 }}>
                   Choose Profile Avatar
                </Typography>
                
                <Box display="flex" alignItems="center" gap={3} mb={4}>
                  <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}
                    sx={{ 
                      borderRadius: 3, textTransform: "none", py: 1.5, px: 3,
                      borderColor: selectedFile ? "#4caf50" : "rgba(255,255,255,0.2)",
                      color: selectedFile ? "#4caf50" : "#fff",
                      "&:hover": { borderColor: "#00d2ff", bgcolor: "rgba(0, 210, 255, 0.05)" }
                    }}
                  >
                    {selectedFile ? "File Selected" : "Upload Custom Photo"}
                    <input type="file" hidden accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                  </Button>
                  
                  {previewUrl && (
                    <Box sx={{ position: "relative" }}>
                      <Avatar src={previewUrl} sx={{ width: 65, height: 65, border: "3px solid #4caf50", boxShadow: "0 0 20px rgba(76, 175, 80, 0.3)" }} />
                      <IconButton size="small" onClick={clearSelectedFile} sx={{ position: "absolute", top: -8, right: -8, bgcolor: "#f44336", color: "white", "&:hover": { bgcolor: "#d32f2f" } }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                    </Box>
                  )}
                </Box>

                {/* Nature Avatars Group */}
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, fontWeight: 700, textTransform: 'uppercase' }}>
                  <NatureIcon sx={{ fontSize: 16 }} /> Nature Themes
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                  {natureAvatars.map((item) => (
                    <Tooltip title={item.seed} key={item.seed}>
                      <Box onClick={() => { setAvatar(item.url); setSelectedFile(null); setPreviewUrl(null); }} sx={avatarBoxStyle(item.url)}>
                        <Box component="img" src={item.url} alt={item.seed} sx={{ width: "100%", height: "100%" }} />
                        {avatar === item.url && <CheckCircleIcon sx={{ position: 'absolute', top: 2, right: 2, color: '#00d2ff', fontSize: 18, bgcolor: '#0f0c29', borderRadius: '50%' }} />}
                      </Box>
                    </Tooltip>
                  ))}
                </Box>

                {/* Gender Specific Group */}
                {gender && (
                  <>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, fontWeight: 700, textTransform: 'uppercase' }}>
                      <FaceIcon sx={{ fontSize: 16 }} /> {gender} Avatars
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      {genderAvatars.map((item) => (
                        <Tooltip title={item.seed} key={item.seed}>
                          <Box onClick={() => { setAvatar(item.url); setSelectedFile(null); setPreviewUrl(null); }} sx={avatarBoxStyle(item.url)}>
                            <Box component="img" src={item.url} alt={item.seed} sx={{ width: "100%", height: "100%" }} />
                            {avatar === item.url && <CheckCircleIcon sx={{ position: 'absolute', top: 2, right: 2, color: '#00d2ff', fontSize: 18, bgcolor: '#0f0c29', borderRadius: '50%' }} />}
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            </Grid2>

            <Grid2 size={{ xs: 12 }} sx={{ mt: 3 }}>
              <Button fullWidth variant="contained" onClick={handleSignup} disabled={!isFormComplete}
                startIcon={<PersonAddIcon />}
                sx={{
                  py: 2, fontSize: "1.1rem", fontWeight: 800, borderRadius: 4, textTransform: "none",
                  background: isFormComplete ? "linear-gradient(45deg, #00d2ff 30%, #9d50bb 90%)" : "rgba(255,255,255,0.05)",
                  boxShadow: isFormComplete ? "0 10px 30px rgba(0, 210, 255, 0.4)" : "none",
                  "&:hover": { background: "linear-gradient(45deg, #9d50bb 30%, #00d2ff 90%)", transform: "translateY(-3px)" },
                  "&:disabled": { color: "rgba(255,255,255,0.1)" }
                }}
              >
                Launch Account
              </Button>
            </Grid2>

            <Grid2 size={{ xs: 12 }} textAlign="center" sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                Already a member? <Link to="/login" style={{ color: "#00d2ff", fontWeight: 700, textDecoration: "none" }}>Log In Here</Link>
              </Typography>
            </Grid2>
          </Grid2>
        </Paper>
      </Container>
    </Box>
  );
}

export default Signup;