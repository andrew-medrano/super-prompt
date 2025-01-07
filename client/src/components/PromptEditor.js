import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Typography,
    Chip,
    Paper,
    Stack
} from '@mui/material';
import * as api from '../services/api';

const PromptEditor = ({ files, onPromptChange }) => {
    const [promptText, setPromptText] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const debouncedGetSuggestions = setTimeout(async () => {
            if (promptText.trim()) {
                try {
                    const newSuggestions = await api.getSuggestions({
                        prompt_text: promptText,
                        files: files
                    });
                    setSuggestions(newSuggestions);
                } catch (error) {
                    console.error('Error getting suggestions:', error);
                }
            }
        }, 500);

        return () => clearTimeout(debouncedGetSuggestions);
    }, [promptText, files]);

    const handlePromptChange = (event) => {
        const newText = event.target.value;
        setPromptText(newText);
        onPromptChange(newText);
    };

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Prompt Editor
            </Typography>

            <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Write your prompt here..."
                value={promptText}
                onChange={handlePromptChange}
                sx={{ mb: 2 }}
            />

            {suggestions.length > 0 && (
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Suggestions to improve your prompt:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {suggestions.map((suggestion, index) => (
                            <Chip
                                key={index}
                                label={suggestion}
                                variant="outlined"
                                size="small"
                                sx={{ mt: 1 }}
                            />
                        ))}
                    </Stack>
                </Paper>
            )}
        </Box>
    );
};

export default PromptEditor; 