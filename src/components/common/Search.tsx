import { useState, useRef } from 'react';
import { Card, IconButton, InputAdornment, OutlinedInput, Tooltip, useMediaQuery } from '@mui/material';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react';
import { X as ClearIcon } from '@phosphor-icons/react';

interface SearchProps {
  refetchAPI: (inputValue: string) => Promise<void>; 
  placeholderText: string;
}

const Search: React.FC<SearchProps> = ({ refetchAPI, placeholderText }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width:480px)");
  const isTab = useMediaQuery("(max-width:920px)");

  const handleSearch = async () => {
    console.log("dsax")
    const trimmedValue = inputValue.trim();
    await refetchAPI(trimmedValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearInput = async () => {
    setInputValue("");
    inputRef.current?.focus();
    await refetchAPI("");
  };

  const handleSearchIconClick = () => {
    if (inputValue.trim() === "") {
      
      setIsActive(true);
      inputRef.current?.focus();
    } else {
      handleSearch();
    }
  };

  return (
    <Card sx={{ p: 2 }}>
      <OutlinedInput
        fullWidth
        inputRef={inputRef}
        placeholder={placeholderText}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsActive(true)}
        onBlur={() => {
          if (inputValue.trim() === "") setIsActive(false);
        }}
        startAdornment={
          isActive && (
          <InputAdornment position="start">
            <Tooltip title="Search" arrow>
              <IconButton aria-label="search" 
              onClick={handleSearchIconClick}
              >
                <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
              </IconButton>
            </Tooltip>
          </InputAdornment>
          )
        }
        endAdornment={
          <InputAdornment position="end">
            {isActive ? (
              <IconButton aria-label="clear" onClick={handleClearInput}>
                <ClearIcon fontSize="var(--icon-fontSize-md)" />
              </IconButton>
            ) : (
              <Tooltip title="Search" arrow>
                <IconButton
                  aria-label="search"
                  onClick={handleSearchIconClick}
                >
                  <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
                </IconButton>
              </Tooltip>
            )}
          </InputAdornment>
        }
        sx={{ maxWidth: '400px' }}
      />
    </Card>
  );
}

export default Search;

