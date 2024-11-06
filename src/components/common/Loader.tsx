import { Box, keyframes } from "@mui/material";
import { styled } from "@mui/system";


const loaderContainerAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoaderContainer = styled(Box)({
  width: "45px",
  height: "45px",
  display: "inline-block",
  padding: "0px",
  borderRadius: "100%",
  border: "5px solid",
  borderTopColor: "blue",
  borderBottomColor: "rgba(255, 255, 255, 0.3)",
  borderLeftColor: "rgba(246, 36, 89, 1)",
  borderRightColor: "rgba(255, 255, 255, 0.3)",
  animation: `${loaderContainerAnimation} 1s ease-in-out infinite`,
});


const BackgroundContainer = styled(Box)({
  background: "transparent",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "fixed",
  top: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "100%",
  zIndex: 9999,
});

const Loader: React.FC = () => {
  return (
    <BackgroundContainer>
      <LoaderContainer />
    </BackgroundContainer>
  );
};

export default Loader;
