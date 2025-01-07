import React, { useState } from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    IconButton,
    Snackbar,
    Alert,
    Stack
} from '@mui/material';
import {
    ContentCopy as CopyIcon,
    Check as CheckIcon
} from '@mui/icons-material';

const CompiledPrompt = ({ prompt, metadata }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1
            }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h6">
                        Compiled Prompt
                    </Typography>
                    {metadata && (
                        <Typography variant="body2" color="text.secondary">
                            {metadata}
                        </Typography>
                    )}
                </Stack>
                <IconButton 
                    onClick={handleCopy}
                    color={copied ? "success" : "default"}
                    size="small"
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                </IconButton>
            </Box>
            <Paper 
                elevation={1}
                sx={{ 
                    p: 2,
                    maxHeight: '200px',
                    overflow: 'auto',
                    bgcolor: 'grey.50',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.5
                }}
            >
                {prompt}
            </Paper>
            <Snackbar
                open={copied}
                autoHideDuration={2000}
                onClose={() => setCopied(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" sx={{ width: '100%' }}>
                    Copied to clipboard!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CompiledPrompt; 