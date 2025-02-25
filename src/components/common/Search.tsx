import React, { useState, useRef, useCallback } from "react";
import { InputAdornment, OutlinedInput, Box, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// Simple debounce function
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

interface SearchProps {
  refetchAPI: (inputValue: string) => Promise<void>;
  holderText?: string;
}

const Search: React.FC<SearchProps> = ({ refetchAPI, holderText = "..." }) => {
  const [inputValue, setInputValue] = useState<string>("");

  const debouncedSearch = useCallback(
    debounce(async (value: string) => {
      if (value.trim() === "") {
        // If input is empty, fetch all data
        await refetchAPI(""); // This triggers full data fetch
      } else {
        // Otherwise, trigger search based on input
        await refetchAPI(value);
      }
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value); // Trigger the debounced function
  };

  const handleSearchIconClick = () => {
    if (inputValue.trim() === "") {
      inputRef.current?.focus();
      refetchAPI(""); // Trigger full data fetch when search icon is clicked with empty input
    } else {
      debouncedSearch(inputValue); // Trigger the debounced function
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

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
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
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
        onChange={handleChange}
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
