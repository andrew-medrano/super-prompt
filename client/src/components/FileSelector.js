import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemSecondaryAction,
    IconButton,
    Typography
} from '@mui/material';
import { Delete, Upload } from '@mui/icons-material';
import * as api from '../services/api';

const FileSelector = ({ onFilesChange }) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            const fileList = await api.listFiles();
            setFiles(fileList);
            onFilesChange(fileList);
        } catch (error) {
            console.error('Error loading files:', error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            await api.uploadFile(file);
            await loadFiles();
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleDelete = async (filePath) => {
        try {
            await api.deleteFile(filePath);
            await loadFiles();
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
                Referenced Files
            </Typography>
            
            <Button
                variant="contained"
                component="label"
                startIcon={<Upload />}
                sx={{ mb: 2 }}
            >
                Upload File
                <input
                    type="file"
                    hidden
                    onChange={handleFileUpload}
                />
            </Button>

            <List dense>
                {files.map((file) => (
                    <ListItem key={file.file_path}>
                        <ListItemText
                            primary={file.file_name}
                            secondary={`Type: ${file.file_type}`}
                        />
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleDelete(file.file_path)}
                            >
                                <Delete />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default FileSelector; 