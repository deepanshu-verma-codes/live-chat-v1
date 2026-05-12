import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Typography,
  TextField,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  InputAdornment,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import moment from "moment";
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PhoneIcon from '@mui/icons-material/Phone';
import VideocamIcon from '@mui/icons-material/Videocam';
import PersonIcon from '@mui/icons-material/Person';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import "./style.css";
import { getUsers, getChatList } from "../api/api";

const socket = io(
  process.env.REACT_APP_CHAT_BASE_URL || "http://localhost:5001",
  { autoConnect: true }
);

const getAvatarUrl = (avatar) => {
  if (!avatar) return "";
  const isPredefined = /^[1-6]$/.test(avatar.toString());
  if (isPredefined) {
    return `https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava${avatar}-bg.webp`;
  }
  const baseUrl = process.env.REACT_APP_CHAT_BASE_URL || "http://localhost:5001";
  return `${baseUrl}/uploads/${avatar}`;
};

function Chat() {
  const [chatUsers, setChatUsers] = useState([]); 
  const [availableUsers, setAvailableUsers] = useState([]); 
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatSearch, setNewChatSearch] = useState("");
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [tempUser, setTempUser] = useState(null); 
  
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);

  // Use refs to avoid re-triggering useEffects
  const selectedUserRef = useRef(null);
  const chatUsersRef = useRef([]);
  const availableUsersRef = useRef([]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    chatUsersRef.current = chatUsers;
  }, [chatUsers]);

  useEffect(() => {
    availableUsersRef.current = availableUsers;
  }, [availableUsers]);

  const fetchData = async () => {
    try {
      const [historyResponse, allUsersResponse] = await Promise.all([
        getChatList(),
        getUsers()
      ]);
      
      setChatUsers(historyResponse);
      
      const historyIds = new Set(historyResponse.map(u => u._id));
      const filteredAvailable = allUsersResponse.filter(u => u._id !== userId && !historyIds.has(u._id));
      setAvailableUsers(filteredAvailable);
    } catch (error) {
      console.error("Error fetching chat data:", error);
    }
  };

  // Handle automatic user selection from navigation state
  useEffect(() => {
    const targetUserId = location.state?.selectUserId;
    if (targetUserId && (chatUsers.length > 0 || availableUsers.length > 0)) {
      // Check if user is in chat history
      const historyUser = chatUsers.find(u => u._id === targetUserId);
      if (historyUser) {
        handleUserSelect(historyUser);
      } else {
        // Check if user is in available users
        const availableUser = availableUsers.find(u => u._id === targetUserId);
        if (availableUser) {
          handleUserSelect(availableUser, true);
        }
      }
      
      // Clear location state to prevent re-selection
      navigate(location.pathname, { replace: true, state: {} });
    }
    // We only want to run this when the state or the initial lists change
  }, [location.state?.selectUserId, chatUsers.length > 0, availableUsers.length > 0]);

  // Socket authentication and initial data fetch
  useEffect(() => {
    if (!token) return;
    socket.emit("authenticate", token);
    fetchData();
  }, [token, userId]);

  // Socket listeners
  useEffect(() => {
    if (!token) return;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("userStatusChanged", (data) => {
        setOnlineUserIds(data.onlineUserIds);
    });

    socket.on("loadMessages", (loadedMessages) => {
      setMessages(loadedMessages);
    });

    socket.on("chatMessage", (msg) => {
      const currentSelected = selectedUserRef.current;
      // If message is for/from the current chat
      if (
        (msg.senderId === userId && msg.recipientId === currentSelected?._id) ||
        (msg.senderId === currentSelected?._id && msg.recipientId === userId)
      ) {
        setMessages((prev) => [...prev, msg]);
        
        // If we are receiving a message in the active chat, mark it as read immediately
        if (msg.senderId === currentSelected?._id) {
            socket.emit("markAsRead", { senderId: msg.senderId });
        }
      }
      
      // Update chat list to reflect new message/unread status
      fetchData();
    });

    socket.on("updateUnreadCount", () => {
        fetchData();
    });

    socket.on("newNotification", (msg) => {
        const currentSelected = selectedUserRef.current;
        if (msg.senderId !== currentSelected?._id) {
            const sender = chatUsersRef.current.find(u => u._id === msg.senderId) || 
                          availableUsersRef.current.find(u => u._id === msg.senderId);
            const senderName = sender ? `${sender.firstName}` : "Someone";
            setSnackbar({ 
                open: true, 
                message: `New message from ${senderName}`, 
                severity: "success" 
            });
        }
    });

    return () => {
      socket.off("connect");
      socket.off("userStatusChanged");
      socket.off("loadMessages");
      socket.off("chatMessage");
      socket.off("updateUnreadCount");
      socket.off("newNotification");
    };
  }, [token, userId]); // Stable dependencies

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUserSelect = (user, isTemp = false) => {
    setSelectedUser(user);
    if (isTemp) {
        setTempUser(user);
    } else {
        setTempUser(null);
    }
    setMessages([]);
    socket.emit("getChatHistory", { recipientId: user._id });
    
    // Mark messages as read when selecting the user
    if (user.unreadCount > 0) {
        socket.emit("markAsRead", { senderId: user._id });
    }
    
    setIsNewChatOpen(false);
  };

  const sendMessage = () => {
    if (input.trim() && selectedUser) {
      socket.emit("chatMessage", {
        recipientId: selectedUser._id,
        message: input,
      });
      setInput("");
    }
  };

  const handleMoreOpen = (event) => setMoreAnchorEl(event.currentTarget);
  const handleMoreClose = () => setMoreAnchorEl(null);
  
  const handleFeatureSoon = (feature) => {
    setSnackbar({ open: true, message: `${feature} feature is coming soon!`, severity: "info" });
    handleMoreClose();
  };

  const handleClearChat = () => {
    setMessages([]);
    setSnackbar({ open: true, message: "Chat history cleared (locally)", severity: "info" });
    handleMoreClose();
  };

  const handleViewProfile = () => {
    if (selectedUser) {
      navigate(`/profile/${selectedUser._id}`);
    }
    handleMoreClose();
  };

  const filteredChatUsers = chatUsers.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableUsers = availableUsers.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(newChatSearch.toLowerCase())
  );

  const sidebarUsers = [...filteredChatUsers];
  if (tempUser && !sidebarUsers.find(u => u._id === tempUser._id)) {
      sidebarUsers.unshift(tempUser);
  }

  const isOnline = (uid) => onlineUserIds.includes(uid);

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100%', 
      p: { xs: 1, md: 4 }, 
      gap: 3, 
      boxSizing: 'border-box',
      background: 'transparent'
    }}>
      {/* Left Panel: Messages List */}
      <Box sx={{ 
        width: { xs: '80px', md: '350px' }, 
        bgcolor: 'rgba(255, 255, 255, 0.03)', 
        backdropFilter: 'blur(20px)',
        borderRadius: '30px', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.2)'
      }}>
        <Box sx={{ p: 3, display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
                Messages
            </Typography>
            <IconButton 
                onClick={() => setIsNewChatOpen(true)}
                sx={{ 
                    background: 'linear-gradient(45deg, #00d2ff, #9d50bb)', 
                    color: '#fff',
                    '&:hover': { transform: 'scale(1.1)' }
                }}
            >
                <AddIcon />
            </IconButton>
          </Box>
          <TextField
            fullWidth
            inputRef={searchInputRef}
            placeholder="Search conversations"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: '50px', 
                bgcolor: 'rgba(255,255,255,0.05)',
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
                height: '45px'
              }
            }}
          />
        </Box>

        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', py: 2 }}>
            <IconButton 
                onClick={() => setIsNewChatOpen(true)}
                sx={{ background: 'linear-gradient(45deg, #00d2ff, #9d50bb)', color: '#fff' }}
            >
                <AddIcon />
            </IconButton>
        </Box>
        
        <Box sx={{ flexGrow: 1, overflowY: "auto", px: { xs: 1, md: 2 }, py: 2 }}>
          <List>
            {sidebarUsers.map((user) => (
              <ListItem
                key={user._id}
                button
                onClick={() => handleUserSelect(user)}
                sx={{
                  borderRadius: '20px',
                  mb: 1,
                  py: 1.5,
                  px: { xs: 1, md: 2 },
                  bgcolor: selectedUser?._id === user._id ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                  border: selectedUser?._id === user._id ? '1px solid rgba(0, 210, 255, 0.2)' : '1px solid transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}
              >
                <ListItemAvatar sx={{ minWidth: { xs: 0, md: 56 } }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: isOnline(user._id) ? '#44b700' : '#777',
                        color: isOnline(user._id) ? '#44b700' : '#777',
                        boxShadow: '0 0 0 2px #1a1a2e',
                      }
                    }}
                  >
                    <Avatar 
                      src={getAvatarUrl(user.avatar)}
                      sx={{ width: 50, height: 50, border: selectedUser?._id === user._id ? '2px solid #00d2ff' : 'none' }}
                    />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={`${user.firstName} ${user.lastName}`}
                  secondary={tempUser?._id === user._id ? "New Conversation" : (isOnline(user._id) ? "Online" : "Offline")}
                  sx={{ display: { xs: 'none', md: 'block' } }}
                  primaryTypographyProps={{ fontWeight: user.unreadCount > 0 ? 900 : 700, fontSize: '1rem', color: '#fff' }}
                  secondaryTypographyProps={{ fontSize: '0.8rem', color: tempUser?._id === user._id ? '#00d2ff' : 'rgba(255,255,255,0.5)' }}
                />
                {user.unreadCount > 0 && selectedUser?._id !== user._id && (
                    <Badge badgeContent={user.unreadCount} color="error" sx={{ mr: 2, '& .MuiBadge-badge': { background: 'linear-gradient(45deg, #ff4b2b, #ff416c)', fontWeight: 800 } }} />
                )}
              </ListItem>
            ))}
            {sidebarUsers.length === 0 && !searchQuery && (
                <Box sx={{ p: 3, textAlign: 'center', opacity: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#fff' }}>No active chats. Click + to start one!</Typography>
                </Box>
            )}
          </List>
        </Box>
      </Box>

      {/* Right Panel: Chat Window */}
      <Box sx={{ 
        flexGrow: 1, 
        bgcolor: 'rgba(255, 255, 255, 0.02)', 
        backdropFilter: 'blur(20px)',
        borderRadius: '30px', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.2)'
      }}>
        {selectedUser ? (
          <>
            {/* Header */}
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    sx={{
                        '& .MuiBadge-badge': {
                            backgroundColor: isOnline(selectedUser._id) ? '#44b700' : '#777',
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            boxShadow: '0 0 0 2px #1a1a2e',
                        },
                        mr: 2
                    }}
                >
                    <Avatar 
                        src={getAvatarUrl(selectedUser.avatar)} 
                        sx={{ width: 45, height: 45, border: '2px solid rgba(0, 210, 255, 0.3)' }} 
                    />
                </Badge>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff' }}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isOnline(selectedUser._id) ? '#44b700' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                    {isOnline(selectedUser._id) ? "Active Now" : "Offline"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => handleFeatureSoon("Voice Call")} sx={{ color: 'rgba(255,255,255,0.6)' }}><PhoneIcon /></IconButton>
                <IconButton onClick={() => handleFeatureSoon("Video Call")} sx={{ color: 'rgba(255,255,255,0.6)' }}><VideocamIcon /></IconButton>
                <IconButton onClick={handleMoreOpen} sx={{ color: 'rgba(255,255,255,0.6)' }}><MoreHorizIcon /></IconButton>
              </Box>
              
              <Menu
                anchorEl={moreAnchorEl}
                open={Boolean(moreAnchorEl)}
                onClose={handleMoreClose}
                PaperProps={{
                  sx: {
                    bgcolor: 'rgba(36, 36, 62, 0.95)',
                    backdropFilter: 'blur(20px)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    minWidth: '180px',
                  }
                }}
              >
                <MenuItem onClick={handleViewProfile}>
                  <ListItemIcon><PersonIcon sx={{ color: '#00d2ff' }} /></ListItemIcon>
                  View Profile
                </MenuItem>
                <MenuItem onClick={handleClearChat}>
                  <ListItemIcon><DeleteSweepIcon sx={{ color: '#00d2ff' }} /></ListItemIcon>
                  Clear Chat
                </MenuItem>
              </Menu>
            </Box>

            {/* Messages */}
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: "auto", 
              p: { xs: 2, md: 4 }, 
              display: 'flex', 
              flexDirection: 'column',
              gap: 1
            }}>
              {messages.map((msg, index) => {
                const isSender = msg.senderId === userId;
                return (
                  <Box
                    key={msg._id || msg.timestamp || index}
                    sx={{
                      display: "flex",
                      flexDirection: isSender ? "row-reverse" : "row",
                      mb: 1,
                      alignItems: "flex-end",
                    }}
                  >
                    <Box sx={{ maxWidth: { xs: "85%", md: "60%" } }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: '12px 20px',
                          borderRadius: isSender ? '25px 25px 5px 25px' : '25px 25px 25px 5px',
                          background: isSender 
                            ? 'linear-gradient(45deg, #00d2ff, #3a7bd5)' 
                            : 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          boxShadow: isSender ? '0 4px 15px rgba(0, 210, 255, 0.2)' : 'none',
                        }}
                      >
                        <Typography variant="body1" sx={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                          {msg.message}
                        </Typography>
                      </Paper>
                      <Typography
                        variant="caption"
                        sx={{ 
                          mt: 0.5, 
                          px: 1,
                          display: "block", 
                          textAlign: isSender ? 'right' : 'left',
                          color: 'rgba(255,255,255,0.3)',
                          fontSize: '0.7rem'
                        }}
                      >
                        {moment(msg.timestamp).format("h:mm A")}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ p: 3, background: 'rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  InputProps={{ 
                    sx: { 
                      bgcolor: 'rgba(255,255,255,0.05)', 
                      borderRadius: '24px', 
                      px: 2,
                      height: '55px',
                      color: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                    }
                  }}
                />
                <IconButton 
                  onClick={sendMessage}
                  sx={{ 
                    background: 'linear-gradient(45deg, #00d2ff, #9d50bb)', 
                    color: 'white',
                    width: '55px',
                    height: '55px',
                    boxShadow: '0 4px 15px rgba(0, 210, 255, 0.3)',
                    '&:hover': { 
                      transform: 'scale(1.05)',
                      boxShadow: '0 6px 20px rgba(0, 210, 255, 0.4)',
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            opacity: 0.5
          }}>
            <Box 
              onClick={() => searchInputRef.current?.focus()}
              sx={{ 
                p: 4, 
                borderRadius: '50%', 
                background: 'rgba(255, 255, 255, 0.05)',
                mb: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { background: 'rgba(0, 210, 255, 0.1)', transform: 'scale(1.1)' }
              }}
            >
              <SearchIcon sx={{ fontSize: 60, color: '#00d2ff' }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 300 }}>
              Select a friend to start chatting
            </Typography>
          </Box>
        )}
      </Box>

      {/* New Chat Dialog */}
      <Dialog 
        open={isNewChatOpen} 
        onClose={() => setIsNewChatOpen(false)}
        PaperProps={{
            sx: {
                bgcolor: 'rgba(36, 36, 62, 0.95)',
                backdropFilter: 'blur(20px)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '450px'
            }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            New Conversation
            <IconButton onClick={() => setIsNewChatOpen(false)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Search people..."
                    value={newChatSearch}
                    onChange={(e) => setNewChatSearch(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#00d2ff' }} /></InputAdornment>,
                        sx: { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '12px' }
                    }}
                />
            </Box>
            <List sx={{ maxHeight: '400px', overflowY: "auto" }}>
                {filteredAvailableUsers.map(user => (
                    <ListItem 
                        button 
                        key={user._id} 
                        onClick={() => handleUserSelect(user, true)}
                        sx={{ px: 3, py: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                    >
                        <ListItemAvatar>
                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                variant="dot"
                                sx={{
                                    '& .MuiBadge-badge': {
                                        backgroundColor: isOnline(user._id) ? '#44b700' : '#777',
                                        boxShadow: '0 0 0 2px #1a1a2e',
                                    }
                                }}
                            >
                                <Avatar src={getAvatarUrl(user.avatar)} />
                            </Badge>
                        </ListItemAvatar>
                        <ListItemText 
                            primary={`${user.firstName} ${user.lastName}`} 
                            secondary={isOnline(user._id) ? "Online" : "Offline"}
                            primaryTypographyProps={{ fontWeight: 700 }}
                            secondaryTypographyProps={{ color: isOnline(user._id) ? '#44b700' : 'rgba(255,255,255,0.4)' }}
                        />
                    </ListItem>
                ))}
                {filteredAvailableUsers.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                        <Typography>No one found to start a new chat with.</Typography>
                    </Box>
                )}
            </List>
        </DialogContent>
      </Dialog>

      {/* Shared Feedback Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%', 
            bgcolor: snackbar.severity === 'success' ? 'rgba(0, 210, 255, 0.9)' : 'rgba(36, 36, 62, 0.9)', 
            color: '#fff',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            '& .MuiAlert-icon': { color: '#fff' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Chat;
