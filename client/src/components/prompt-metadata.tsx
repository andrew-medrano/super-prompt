import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Description, Code, Token } from '@mui/icons-material';
import { PromptMetadataProps } from '../types/prompt';

const formatTokenCount = (count: number): string => {
    if (count === 0) return '~0';
    if (count < 100) return `~${count}`;
    if (count < 1000) return `~${Math.round(count/10)*10}`;
    return `~${(Math.round(count/100)/10).toFixed(1)}k`;
};

export const PromptMetadata: React.FC<PromptMetadataProps> = ({ fileCount, systemPromptCount, totalTokens }) => {
    return (
        <Box sx={{ 
            display: 'flex', 
            gap: 2,
            alignItems: 'center',
            p: 1,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
        }}>
            <Chip
                icon={<Code />}
                label={`${fileCount} file${fileCount !== 1 ? 's' : ''}`}
                variant="outlined"
                size="small"
            />
            <Chip
                icon={<Description />}
                label={`${systemPromptCount} system prompt${systemPromptCount !== 1 ? 's' : ''}`}
                variant="outlined"
                size="small"
            />
            <Chip
                icon={<Token />}
                label={`${formatTokenCount(totalTokens)} tokens`}
                variant="outlined"
                size="small"
                color="primary"
            />
        </Box>
    );
}; 