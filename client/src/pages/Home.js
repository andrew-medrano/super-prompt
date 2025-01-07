import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Box,
    Typography,
    useTheme
} from '@mui/material';
import FileSelector from '../components/FileSelector';
import PromptEditor from '../components/PromptEditor';
import SystemPromptInput from '../components/SystemPromptInput';
import PreviewPanel from '../components/PreviewPanel';
import * as api from '../services/api';

const Home = () => {
    const theme = useTheme();
    const [files, setFiles] = useState([]);
    const [promptText, setPromptText] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [compiledPrompt, setCompiledPrompt] = useState('');
    const [metadata, setMetadata] = useState({});

    useEffect(() => {
        const compilePrompt = async () => {
            if (promptText.trim()) {
                try {
                    const response = await api.compilePrompt({
                        prompt_text: promptText,
                        system_prompt: systemPrompt,
                        files: files
                    });
                    setCompiledPrompt(response.compiled_prompt);
                    setMetadata(response.metadata);
                } catch (error) {
                    console.error('Error compiling prompt:', error);
                }
            }
        };

        const debounceCompile = setTimeout(compilePrompt, 500);
        return () => clearTimeout(debounceCompile);
    }, [promptText, systemPrompt, files]);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Super Prompt
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Create powerful, context-aware prompts for AI models
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Box sx={{ 
                        bgcolor: theme.palette.background.paper,
                        p: 3,
                        borderRadius: 1,
                        boxShadow: 1
                    }}>
                        <FileSelector onFilesChange={setFiles} />
                    </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Box sx={{
                        bgcolor: theme.palette.background.paper,
                        p: 3,
                        borderRadius: 1,
                        boxShadow: 1
                    }}>
                        <SystemPromptInput
                            value={systemPrompt}
                            onChange={setSystemPrompt}
                        />
                        <PromptEditor
                            files={files}
                            onPromptChange={setPromptText}
                        />
                        <PreviewPanel
                            compiledPrompt={compiledPrompt}
                            metadata={metadata}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Home; 