import { useState, useRef } from 'react';
import { Card, IconButton, InputAdornment, OutlinedInput, Tooltip, useMediaQuery } from '@mui/material';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { X as ClearIcon } from '@phosphor-icons/react/dist/ssr/X';

interface SearchProps {
  refetchAPI: (inputValue: string) => Promise<void>;
}

const Search: React.FC<SearchProps> = ({ refetchAPI }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMobile = useMediaQuery("(max-width:480px)");
  const isTab = useMediaQuery("(max-width:920px)");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSearchIconClick = () => {
    if (inputValue.trim() === "") {
      setIsActive(true);         // Activate the search field with blinking cursor
      inputRef.current?.focus();
    } else {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (inputValue.trim()) {  // Prevent empty search
      console.log('this is input value=>', inputValue);
      // await refetchAPI(inputValue);    implement API call later
    }
  };

  // Search data by pressing down the enter key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearInput = () => {
    setInputValue("");
    setIsActive(false);      // Deactivate the field if it’s empty
    inputRef.current?.blur();
  };

  return (
    <Card sx={{ p: 2 }}>
      <OutlinedInput
        fullWidth
        inputRef={inputRef}
        placeholder="Search Appointment"
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
              <IconButton
                aria-label="search"
                onClick={handleSearchIconClick}
              >
                <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
              </IconButton>
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
