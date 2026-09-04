import React from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingChatbot from "../components/FloatingChatbot";

const LayoutWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
});

const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  justifyContent: "center",
  padding: theme.spacing(4, 2),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(6, 4),
  },
}));

const MainLayout = ({
  children,
  showTabs = true,
  navItems = [],
  homePath = "/studentDashboard",
  showFloatingChatbot = true,
}) => {
  return (
    <LayoutWrapper>
      <Header
        showTabs={showTabs}
        navItems={navItems}
        homePath={homePath}
      />

      <ContentArea>
        <Box sx={{ width: "100%", maxWidth: "1000px" }}>
          {children}
        </Box>
      </ContentArea>

      <Footer />

      {showFloatingChatbot && <FloatingChatbot />}
    </LayoutWrapper>
  );
};

export default MainLayout;