import React, { useState, useRef } from "react";
import { InputAdornment, OutlinedInput, Box, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchProps {
  refetchAPI: (inputValue: string) => Promise<void>;
  holderText?: string;
}

const Search: React.FC<SearchProps> = ({ refetchAPI, holderText = "..." }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchIconClick = () => {
    if (inputValue.trim() === "") {
      inputRef.current?.focus();
    } else {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (inputValue.trim()) {
      console.log("Search Value:", inputValue);
      await refetchAPI(inputValue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        maxWidth: "600px",
        width: "100%",
      }}
    >
      <IconButton
        onClick={handleSearchIconClick}
        sx={{
          background: "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
          borderRadius: "50%",
          color: "white",
          cursor: "pointer",
          height: "50px",
          width: "50px",
          position: "absolute",
          left: "-10px",
          zIndex: 1,
          "&:hover": {
            background: "linear-gradient(45deg, #1976D2 30%, #0D47A1 90%)",
          },
        }}
      >
        <SearchIcon sx={{ fontSize: "20px" }} />
      </IconButton>

      <OutlinedInput
        fullWidth
        inputRef={inputRef}
        placeholder={`Search ${holderText}`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          borderRadius: "25px",
          paddingLeft: "0px",
          height: "50px",
          backgroundColor: "white",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          fontSize: "16px",
          color: "gray",
          "& .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #ddd",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ccc",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#bbb",
          },
        }}
        startAdornment={
          <InputAdornment position="start">
            <Box sx={{ width: "50px" }} />
          </InputAdornment>
        }
      />
    </Box>
  );
};

export default Search;
