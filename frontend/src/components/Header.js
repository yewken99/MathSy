import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  Popover,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { logUserActivity } from "../utils/logger";
import { useLanguage } from "../context/LanguageContext";
import { apiFetch } from "../utils/apiFetch";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

import HomeIcon from "@mui/icons-material/DashboardOutlined";
import CameraAltIcon from "@mui/icons-material/CenterFocusStrongOutlined";
import SchoolIcon from "@mui/icons-material/LocalLibraryOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import TranslateIcon from "@mui/icons-material/Translate";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import logo from "../assets/landingpage/logo.png";

const StyledAppBar = styled(AppBar)({
  backgroundColor: "#ffffff",
  boxShadow: "0px 1px 5px rgba(0, 0, 0, 0.05)",
  padding: "0 12px",
});

const Header = ({
  showTabs = true,
  navItems: navItemsProp = [],
  homePath = "/studentDashboard",
}) => {
  const { t, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {},
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const handleRequestLogout = () => {
    setOpenLogoutDialog(true);
  };

  const handleCloseLogoutDialog = () => {
    setOpenLogoutDialog(false);
  };

  const handleConfirmLogout = async () => {
    try {
      logUserActivity("logout");
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out from Firebase:", error);
    } finally {
      localStorage.removeItem("user");
      setLanguage("english");
      setUser({});
      setAnchorEl(null);
      setOpenLogoutDialog(false);
      navigate("/login");
    }
  };

  const handleOpenProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (newLanguage) => {
    if (!newLanguage || newLanguage === user?.language) return;

    try {
      setIsSavingLanguage(true);

      const response = await apiFetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/me/language`,
        {
          method: "PUT",
          body: JSON.stringify({
            language: newLanguage,
          }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Failed to update language");
        return;
      }

      const updatedUser = {
        ...user,
        language: newLanguage,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setLanguage(newLanguage);
    } catch (error) {
      console.error("Failed to update language:", error);
      alert("Failed to update language");
    } finally {
      setIsSavingLanguage(false);
    }
  };

  const defaultStudentNavItems = [
    {
      label: t("header_home"),
      icon: <HomeIcon sx={{ fontSize: 20 }} />,
      path: "/studentDashboard",
    },
    {
      label: t("header_quick_snap"),
      icon: <CameraAltIcon sx={{ fontSize: 20 }} />,
      path: "/quick-snap",
    },
    {
      label: t("header_practice"),
      icon: <SchoolIcon sx={{ fontSize: 20 }} />,
      path: "/practice",
    },
  ];

  const navItems =
    navItemsProp && navItemsProp.length > 0
      ? navItemsProp
      : defaultStudentNavItems;

  const currentTab = navItems.findIndex((item) =>
    location.pathname.startsWith(item.path),
  );
  const activeTab = currentTab === -1 ? false : currentTab;
  const open = Boolean(anchorEl);

  return (
    <StyledAppBar position="sticky">
      <Toolbar
        disableGutters
        sx={{
          display: "grid",
          gridTemplateColumns: "auto minmax(0, 1fr) auto",
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
          width: "100%",
          minWidth: 0,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Mathsy Logo"
          sx={{
            height: { xs: 22, sm: 28 },
            maxWidth: { xs: 140, sm: 190 },
            width: "auto",
            cursor: "pointer",
            display: "block",
          }}
          onClick={() => navigate(homePath)}
        />
        {showTabs ? (
          <Box
            sx={{
              minWidth: 0,
              overflowX: "auto",
              overflowY: "hidden",
              display: "flex",
              justifyContent: "center",
              px: { xs: 0.5, sm: 1 },
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Tabs
              value={activeTab}
              TabIndicatorProps={{
                style: {
                  height: "100%",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.08)",
                },
              }}
              sx={{
                minHeight: "40px",
                height: "40px",
                backgroundColor: "#F3F4F6",
                borderRadius: "10px",
                padding: "4px",
                width: "max-content",
                minWidth: "max-content",
                "& .MuiTabs-flexContainer": {
                  gap: { xs: 0.5, sm: 0 },
                },
                "& .MuiTabs-indicator": {
                  zIndex: 0,
                },
              }}
            >
              {navItems.map((item) => (
                <Tooltip
                  key={item.label}
                  title={item.label}
                  arrow
                  disableInteractive
                >
                  <Tab
                    label={isMobile ? null : item.label}
                    icon={item.icon}
                    iconPosition="start"
                    disableRipple
                    onClick={() => navigate(item.path)}
                    sx={{
                      textTransform: "none",
                      fontWeight: "500",
                      fontSize: { xs: "12px", sm: "13px" },
                      minHeight: "32px",
                      height: "32px",
                      padding: isMobile ? "4px 8px" : "4px 14px",
                      minWidth: isMobile ? "44px" : "88px",
                      color: "#6b7280",
                      borderRadius: "8px",
                      zIndex: 1,
                      transition: "all 0.3s ease",
                      flexShrink: 0,
                      "&.Mui-selected": {
                        color: "#3855c0",
                        fontWeight: "700",
                      },
                      "& .MuiTab-iconWrapper": {
                        marginRight: isMobile ? "0px" : "8px",
                        marginBottom: 0,
                      },
                    }}
                  />
                </Tooltip>
              ))}
            </Tabs>
          </Box>
        ) : (
          <Box />
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1.5 },
            flexShrink: 0,
            justifySelf: "end",
          }}
        >
          <IconButton onClick={handleOpenProfileMenu} sx={{ p: 0 }}>
            <Avatar
              src={user?.photo_url || ""}
              alt={user?.name || "User Account"}
              sx={{
                width: 32,
                height: 32,
                cursor: "pointer",
                border: "1px solid #3855c0",
                bgcolor: "#E0E7FF",
                color: "#3855c0",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {!user?.photo_url && (user?.name?.[0]?.toUpperCase() || "U")}
            </Avatar>
          </IconButton>

          {!isMobile && (
            <Divider
              orientation="vertical"
              flexItem
              sx={{ my: 0.5, borderColor: "#cfd0d1", borderWidth: 1 }}
            />
          )}

          <IconButton onClick={handleRequestLogout} sx={{ padding: "4px" }}>
            <LogoutIcon sx={{ color: "#3855c0", fontSize: 22 }} />
          </IconButton>
        </Box>
      </Toolbar>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseProfileMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 320,
            borderRadius: "20px",
            p: 2.5,
            border: "1px solid #E5E7EB",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.10)",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            src={user?.photo_url || ""}
            alt={user?.name || "User"}
            sx={{
              width: 52,
              height: 52,
              bgcolor: "#E0E7FF",
              color: "#3855c0",
              fontWeight: 700,
            }}
          >
            {!user?.photo_url && (user?.name?.[0]?.toUpperCase() || "U")}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontWeight="bold"
              sx={{ color: "#111827", lineHeight: 1.2 }}
            >
              {user?.name || "User"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#6B7280",
                mt: 0.4,
                wordBreak: "break-word",
              }}
            >
              {user?.email || "-"}
            </Typography>
          </Box>
        </Box>

        {user?.role === "student" && user?.student_code && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                p: 1.5,
                borderRadius: "14px",
                bgcolor: "#F9FAFB",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  minWidth: 0,
                }}
              >
                <BadgeOutlinedIcon
                  sx={{ color: "#6B7280", fontSize: 20, flexShrink: 0 }}
                />

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#9CA3AF",
                      fontWeight: 700,
                      display: "block",
                      mb: 0.3,
                    }}
                  >
                    {t("header_student_id")}
                  </Typography>

                  <Typography sx={{ color: "#111827", fontWeight: 700 }}>
                    {user.student_code}
                  </Typography>
                </Box>
              </Box>

              <Tooltip
                title={t("header_student_id_tooltip")}
                arrow
                placement="top"
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    minWidth: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9CA3AF",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "#EEF2FF",
                      color: "#3855c0",
                    },
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                </Box>
              </Tooltip>
            </Box>
          </>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            p: 1.5,
            borderRadius: "14px",
            bgcolor: "#F9FAFB",
            border: "1px solid #E5E7EB",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TranslateIcon sx={{ color: "#6B7280", fontSize: 18 }} />
            <Typography
              fontWeight="bold"
              sx={{ color: "#111827", fontSize: "14px" }}
            >
              {t("header_language")}
            </Typography>
            {isSavingLanguage && <CircularProgress size={14} />}
          </Box>

          <Box
            sx={{
              width: 96,
              height: 36,
              display: "flex",
              alignItems: "center",
              backgroundColor: "#ffffff",
              border: "2px solid #3855c0",
              borderRadius: "999px",
              p: "3px",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Box
              onClick={() => handleLanguageChange("english")}
              sx={{
                flex: 1,
                textAlign: "center",
                py: 0.7,
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "13px",
                lineHeight: 1,
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor:
                  user?.language === "english" ? "#3855c0" : "transparent",
                color: user?.language === "english" ? "#ffffff" : "#3855c0",
                userSelect: "none",
              }}
            >
              EN
            </Box>

            <Box
              onClick={() => handleLanguageChange("bm")}
              sx={{
                flex: 1,
                textAlign: "center",
                py: 0.7,
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "13px",
                lineHeight: 1,
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor:
                  user?.language === "bm" ? "#3855c0" : "transparent",
                color: user?.language === "bm" ? "#ffffff" : "#3855c0",
                userSelect: "none",
              }}
            >
              BM
            </Box>
          </Box>
        </Box>
      </Popover>
      <Dialog
        open={openLogoutDialog}
        onClose={handleCloseLogoutDialog}
        PaperProps={{
          sx: {
            borderRadius: "18px",
            px: 1,
            py: 1,
            width: "100%",
            maxWidth: 420,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#111827" }}>
          {t("header_logout_title")}
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ color: "#4B5563" }}>
            {t("header_logout_desc")}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            onClick={handleCloseLogoutDialog}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: "#6B7280",
            }}
          >
            {t("header_logout_cancel")}
          </Button>

          <Button
            onClick={handleConfirmLogout}
            variant="contained"
            disableElevation
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              bgcolor: "#c03838",
              "&:hover": {
                bgcolor: "#992d2d",
              },
            }}
          >
            {t("header_logout_confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledAppBar>
  );
};

export default Header;
