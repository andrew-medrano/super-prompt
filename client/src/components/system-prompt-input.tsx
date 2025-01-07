import React, { useState, KeyboardEvent, ChangeEvent, useEffect } from 'react';
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
import { ContentBlock } from '../components/content-block';
import { PRESET_PROMPTS } from '../config/presets';
import { SystemPromptInputProps, PresetPrompt } from '../types/prompt';

export const SystemPromptInput: React.FC<SystemPromptInputProps> = ({ value, onChange, onFileTreeChange }) => {
    const [isEditing, setIsEditing] = useState<boolean>(!value);
    const [localValue, setLocalValue] = useState<string>(value || '');
    const [activePreset, setActivePreset] = useState<string | null>(null);
    const [includeFileTree, setIncludeFileTree] = useState<boolean>(false);
    const tokenCount = Math.round(localValue.split(/\s+/).length * 1.3);

    useEffect(() => {
        // Optional: On mount, try loading a saved prompt
        const saved = localStorage.getItem('savedSystemPrompt');
        if (!value && saved) {
            setLocalValue(saved);
            onChange(saved);
        }
    }, [value, onChange]);

    const handlePresetClick = (key: string, preset: PresetPrompt): void => {
        setActivePreset(key);
        setLocalValue(preset.prompt);
        onChange(preset.prompt);
        setIsEditing(false);
    };

    const handleSave = (): void => {
        onChange(localValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        }
    };

    const handleFileTreeToggle = (event: ChangeEvent<HTMLInputElement>): void => {
        setIncludeFileTree(event.target.checked);
        onFileTreeChange(event.target.checked);
    };

    const handleRemove = (): void => {
        setLocalValue('');
        onChange('');
        setActivePreset(null);
        setIsEditing(false);
    };

    const handleSavePrompt = () => {
        localStorage.setItem('savedSystemPrompt', localValue);
    };

    const handleLoadPrompt = () => {
        const saved = localStorage.getItem('savedSystemPrompt');
        if (saved) {
            setLocalValue(saved);
            onChange(saved);
            setIsEditing(false);
        }
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
                {(Object.entries(PRESET_PROMPTS) as [string, PresetPrompt][]).map(([key, preset]) => (
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

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button variant="outlined" size="small" onClick={handleSavePrompt}>
                    Save Prompt
                </Button>
                <Button variant="outlined" size="small" onClick={handleLoadPrompt}>
                    Load Prompt
                </Button>
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
                        onRemove={handleRemove}
                    />
                </Box>
            )}
        </Box>
    );
};