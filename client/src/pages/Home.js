import React, { useState } from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    TextField,
    Divider
} from '@mui/material';
import FileSelector from '../components/FileSelector';
import SystemPromptInput from '../components/SystemPromptInput';
import CompiledPrompt from '../components/CompiledPrompt';
import PromptMetadata from '../components/PromptMetadata';

const Home = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [mainPrompt, setMainPrompt] = useState('');
    const [includeFileTree, setIncludeFileTree] = useState(false);

    const generateFileTree = (files) => {
        // Create a map of directories
        const dirMap = new Map();
        
        // Sort files by path to ensure proper directory structure
        const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));
        
        sortedFiles.forEach(file => {
            const parts = file.path.split('/');
            let currentPath = '';
            
            // Build directory structure
            parts.forEach((part, index) => {
                const isLast = index === parts.length - 1;
                const indent = '  '.repeat(index);
                const prefix = isLast ? '└── ' : '├── ';
                
                if (!isLast) {
                    currentPath = currentPath ? `${currentPath}/${part}` : part;
                    if (!dirMap.has(currentPath)) {
                        dirMap.set(currentPath, `${indent}${prefix}${part}/`);
                    }
                } else {
                    dirMap.set(file.path, `${indent}${prefix}${part}`);
                }
            });
        });

        // Convert map to sorted array and join with newlines
        return Array.from(dirMap.values()).join('\n');
    };

    const compilePrompt = () => {
        let result = systemPrompt;

        // Add file tree if enabled
        if (includeFileTree && selectedFiles.length > 0) {
            const fileTree = generateFileTree(selectedFiles);
            result += '\n\nProject Structure:\n' + fileTree;
        }

        // Add main prompt
        result += '\n\nPrompt:\n' + mainPrompt;

        // Add file contents
        if (selectedFiles.length > 0) {
            const fileContents = selectedFiles.map(file => 
                `File: ${file.path}\n\n${file.content}\n`
            ).join('\n---\n\n');
            result += '\n\nIncluded Files:\n\n' + fileContents;
        }

        return result;
    };

    // Calculate total token count
    const getTotalTokens = () => {
        const fileTokens = selectedFiles.reduce((acc, file) => acc + (file.tokenCount || 0), 0);
        // Rough estimation for system prompt and main prompt (4 chars per token)
        const systemTokens = Math.ceil(systemPrompt.length / 4);
        const mainTokens = Math.ceil(mainPrompt.length / 4);
        return fileTokens + systemTokens + mainTokens;
    };

    // Count active system prompts (non-empty)
    const getSystemPromptCount = () => {
        return systemPrompt.trim() ? 1 : 0;
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ 
                p: 3, 
                borderBottom: 1, 
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}>
                <Typography variant="h4" gutterBottom>
                    Super Prompt
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    Build powerful, context-aware prompts for AI models by combining system instructions, 
                    your prompt, and relevant code files. Perfect for complex software development tasks 
                    and technical discussions.
                </Typography>
            </Box>

            {/* Main content area */}
            <Box sx={{ 
                flexGrow: 1,
                display: 'flex',
                overflow: 'hidden'
            }}>
                {/* Left sidebar - File Explorer */}
                <Box sx={{ 
                    width: 400, 
                    flexShrink: 0,
                    borderRight: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <FileSelector 
                        onFilesChange={setSelectedFiles}
                    />
                </Box>

                {/* Right content area */}
                <Box sx={{ 
                    flexGrow: 1,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    gap: 3
                }}>
                    {/* System Prompt */}
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <SystemPromptInput 
                            value={systemPrompt} 
                            onChange={setSystemPrompt}
                            onFileTreeChange={setIncludeFileTree}
                        />
                    </Paper>

                    {/* Main Prompt */}
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Your Prompt
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={mainPrompt}
                            onChange={(e) => setMainPrompt(e.target.value)}
                            placeholder="Enter your prompt here..."
                            variant="outlined"
                        />
                    </Paper>

                    {/* Compiled Prompt */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <Paper elevation={0} sx={{ 
                            p: 2, 
                            bgcolor: 'grey.50', 
                            flexGrow: 1,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                        }}>
                            <CompiledPrompt 
                                prompt={compilePrompt()}
                                metadata={`${selectedFiles.length} files · ${getSystemPromptCount()} system prompts · ~${getTotalTokens()} tokens`}
                            />
                        </Paper>
                        <PromptMetadata 
                            fileCount={selectedFiles.length}
                            systemPromptCount={getSystemPromptCount()}
                            totalTokens={getTotalTokens()}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Home; 