import React, { useState } from 'react';
import { 
    Box, 
    TextField, 
    Typography,
    IconButton,
    Tooltip,
    Button,
    Stack,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { Help as HelpIcon } from '@mui/icons-material';
import ContentBlock from './ContentBlock';
import { PRESET_PROMPTS } from '../config/presets';

const SystemPromptInput = ({ value, onChange, onFileTreeChange }) => {
    const [isEditing, setIsEditing] = useState(!value);
    const [localValue, setLocalValue] = useState(value || '');
    const [activePreset, setActivePreset] = useState(null);
    const [includeFileTree, setIncludeFileTree] = useState(false);
    const tokenCount = Math.round(localValue.split(/\s+/).length * 1.3);

    const handlePresetClick = (key, preset) => {
        setActivePreset(key);
        setLocalValue(preset.prompt);
        onChange(preset.prompt);
        setIsEditing(false);
    };

    const handleSave = () => {
        onChange(localValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        }
    };

    const handleFileTreeToggle = (event) => {
        setIncludeFileTree(event.target.checked);
        onFileTreeChange(event.target.checked);
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                <Typography variant="subtitle1">
                    System Instructions
                </Typography>
                <Tooltip title="Instructions that guide the AI's behavior and set context">
                    <IconButton size="small">
                        <HelpIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Box sx={{ flexGrow: 1 }} />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={includeFileTree}
                            onChange={handleFileTreeToggle}
                            size="small"
                        />
                    }
                    label={
                        <Typography variant="body2">
                            Include file tree structure
                        </Typography>
                    }
                />
            </Box>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {Object.entries(PRESET_PROMPTS).map(([key, preset]) => (
                    <Button
                        key={key}
                        variant={activePreset === key ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handlePresetClick(key, preset)}
                    >
                        {preset.name}
                    </Button>
                ))}
            </Stack>

            {isEditing ? (
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter system-level instructions..."
                    helperText="Press Ctrl+Enter to save"
                    variant="outlined"
                    size="small"
                    sx={{ 
                        '& .MuiOutlinedInput-root': {
                            padding: '8px 14px'
                        }
                    }}
                />
            ) : (
                <Box onClick={() => setIsEditing(true)} sx={{ cursor: 'pointer' }}>
                    <ContentBlock
                        title={activePreset ? PRESET_PROMPTS[activePreset].name : "System Instructions"}
                        content={localValue || "Click to add system instructions..."}
                        type="system"
                        tokenCount={tokenCount}
                    />
                </Box>
            )}
        </Box>
    );
};

export default SystemPromptInput; 