import React from 'react';
import {
    Box,
    TextField,
    Typography,
    Tooltip,
    IconButton
} from '@mui/material';
import { HelpOutline } from '@mui/icons-material';

const SystemPromptInput = ({ value, onChange }) => {
    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                    System Instructions
                </Typography>
                <Tooltip title="System instructions help set the context and constraints for the AI model">
                    <IconButton size="small">
                        <HelpOutline fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Add system-level instructions here (optional)..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                    }
                }}
            />
        </Box>
    );
};

export default SystemPromptInput; 