import React, { useState, useRef } from 'react';
import { 
    Box, 
    Button,
    Typography,
    List,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Collapse,
    Chip,
    Snackbar,
    Alert,
    Menu,
    MenuItem
} from '@mui/material';
import {
    FolderOutlined,
    FolderOpenOutlined,
    InsertDriveFileOutlined,
    ExpandLess,
    ExpandMore,
    Add,
    CheckCircle,
    Upload
} from '@mui/icons-material';
import * as api from '../services/api';
import ContentBlock from './ContentBlock';

// Check if File System Access API is supported
const isFileSystemAccessSupported = () => {
    return 'showDirectoryPicker' in window;
};

// Helper function to count all files in the tree
const getAllFilesCount = (node) => {
    if (node.type === 'file') {
        return 1;
    }
    return node.children.reduce((acc, child) => acc + getAllFilesCount(child), 0);
};

const FileTreeItem = ({ item, level = 0, onFileClick, selectedFiles }) => {
    const [open, setOpen] = useState(false);
    const isSelected = selectedFiles.some(f => f.path === item.path);

    const handleClick = () => {
        if (item.type === 'directory') {
            setOpen(!open);
        } else {
            onFileClick(item);
        }
    };

    return (
        <>
            <ListItemButton
                onClick={handleClick}
                sx={{ 
                    pl: level * 2 + 1,
                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                    '&:hover': {
                        bgcolor: isSelected ? 'action.selected' : undefined
                    }
                }}
            >
                <ListItemIcon sx={{ minWidth: 36 }}>
                    {item.type === 'directory' ? (
                        open ? <FolderOpenOutlined /> : <FolderOutlined />
                    ) : (
                        <InsertDriveFileOutlined />
                    )}
                </ListItemIcon>
                <ListItemText 
                    primary={item.name}
                    sx={{
                        '.MuiListItemText-primary': {
                            color: isSelected ? 'primary.main' : 'text.primary',
                            fontWeight: isSelected ? 500 : 400
                        }
                    }}
                />
                {item.type === 'directory' && (
                    item.children.length > 0 ? (
                        open ? <ExpandLess /> : <ExpandMore />
                    ) : null
                )}
                {isSelected && (
                    <CheckCircle 
                        color="primary" 
                        sx={{ ml: 1, fontSize: 20 }}
                    />
                )}
            </ListItemButton>
            {item.type === 'directory' && item.children.length > 0 && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {item.children.map((child, index) => (
                            <FileTreeItem
                                key={index}
                                item={child}
                                level={level + 1}
                                onFileClick={onFileClick}
                                selectedFiles={selectedFiles}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

const FileSelector = ({ onFilesChange }) => {
    const [tree, setTree] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const fileInputRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleModernDirectorySelect = async () => {
        try {
            const dirHandle = await window.showDirectoryPicker({
                mode: 'read'
            });

            // Get the directory path
            const { path: cwd } = await api.getCwd();
            // Go up one directory from server to get to project root
            const projectRoot = cwd.split('/server')[0];
            const fullPath = projectRoot;
            
            console.log('DEBUG - Directory Selection:');
            console.log('Current working directory:', cwd);
            console.log('Project root path:', projectRoot);
            console.log('Full path:', fullPath);
            
            try {
                const treeData = await api.getDirectoryTree(fullPath);
                console.log('DEBUG - Tree Data:', treeData);
                // Store the project root path in state for later use
                setTree({
                    ...treeData,
                    projectRoot: fullPath
                });
            } catch (error) {
                console.error('Error getting directory tree:', error);
                setError('Could not access the selected directory');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Directory selection error:', error);
                setError('Error selecting directory: ' + error.message);
            }
        }
    };

    const handleLegacyFileSelect = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        try {
            // Create a virtual tree structure from the selected files
            const virtualTree = {
                type: 'directory',
                name: 'Selected Files',
                path: '',
                children: files.map(file => ({
                    type: 'file',
                    name: file.name,
                    path: file.name,
                    extension: file.name.split('.').pop() || '',
                    content: null // Will be loaded when clicked
                }))
            };

            setTree(virtualTree);
            // Clear the input for future selections
            event.target.value = '';
        } catch (error) {
            setError('Error processing files: ' + error.message);
            console.error('Error processing files:', error);
        }
    };

    const handleDirectorySelect = (event) => {
        if (isFileSystemAccessSupported()) {
            handleModernDirectorySelect();
        } else {
            // Show the menu with options for legacy browsers
            setMenuAnchor(event.currentTarget);
        }
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleFileClick = async (file) => {
        const isSelected = selectedFiles.some(f => f.path === file.path);
        let newSelectedFiles;
        
        if (isSelected) {
            newSelectedFiles = selectedFiles.filter(f => f.path !== file.path);
        } else {
            try {
                console.log('DEBUG - File Click:');
                console.log('File object:', file);
                
                let content, tokenCount;
                
                // If it's from the legacy file input, read the file directly
                const legacyFile = fileInputRef.current?.files?.[0];
                if (legacyFile) {
                    content = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.onerror = reject;
                        reader.readAsText(legacyFile);
                    });
                    tokenCount = 0; // We don't estimate tokens for legacy files
                } else {
                    const response = await api.getFileContent(file.path);
                    content = response.content;
                    tokenCount = response.token_count;
                }
                
                // Extract the relative path by finding "super_prompt/" and taking everything after it
                const relativePath = file.path.split('super_prompt/')[1];
                
                console.log('DEBUG - Path Processing:');
                console.log('Original file path:', file.path);
                console.log('After split:', relativePath);
                
                newSelectedFiles = [...selectedFiles, {
                    ...file,
                    path: relativePath,
                    content,
                    tokenCount
                }];

                console.log('DEBUG - New file object:', newSelectedFiles[newSelectedFiles.length - 1]);
            } catch (error) {
                setError('Error loading file: ' + error.message);
                console.error('Error loading file content:', error);
                return;
            }
        }
        
        setSelectedFiles(newSelectedFiles);
        onFilesChange(newSelectedFiles);
    };

    const handleRemoveFile = (file) => {
        const newSelectedFiles = selectedFiles.filter(f => f.path !== file.path);
        setSelectedFiles(newSelectedFiles);
        onFilesChange(newSelectedFiles);
    };

    const handleSelectAll = async () => {
        if (!tree) return;
        
        const allFiles = [];
        
        // Recursively collect all files from the tree
        const collectFiles = async (node) => {
            if (node.type === 'file') {
                try {
                    console.log('Loading content for:', node.path);
                    const response = await api.getFileContent(node.path);
                    // Extract the relative path by finding "super_prompt/" and taking everything after it
                    const relativePath = node.path.split('super_prompt/')[1];
                    
                    allFiles.push({
                        ...node,
                        path: relativePath,  // Use the relative path
                        content: response.content,
                        tokenCount: response.token_count
                    });
                } catch (error) {
                    console.error('Error loading file:', node.path, error);
                }
            } else if (node.children) {
                for (const child of node.children) {
                    await collectFiles(child);
                }
            }
        };
        
        try {
            await collectFiles(tree);
            setSelectedFiles(allFiles);
            onFilesChange(allFiles);
        } catch (error) {
            setError('Error selecting all files: ' + error.message);
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%'
        }}>
            <Box sx={{ 
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        File Explorer
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                        <Button
                            startIcon={<Add />}
                            size="small"
                            onClick={handleDirectorySelect}
                            variant="outlined"
                        >
                            Select Directory
                        </Button>
                        {tree && (
                            <>
                                <Button
                                    startIcon={<CheckCircle />}
                                    size="small"
                                    onClick={handleSelectAll}
                                    variant="outlined"
                                    color="secondary"
                                    disabled={selectedFiles.length === getAllFilesCount(tree)}
                                >
                                    Select All Files
                                </Button>
                                {selectedFiles.length > 0 && (
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setSelectedFiles([]);
                                            onFilesChange([]);
                                        }}
                                        variant="outlined"
                                        color="error"
                                    >
                                        Clear All
                                    </Button>
                                )}
                            </>
                        )}
                    </Box>
                </Box>

                {selectedFiles.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Box 
                            onClick={() => setIsExpanded(!isExpanded)}
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                cursor: 'pointer',
                                mb: isExpanded ? 1 : 0,
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                },
                                py: 1,
                                px: 2,
                                borderRadius: 1,
                                border: 1,
                                borderColor: 'divider',
                                minHeight: 40
                            }}
                        >
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                Selected Files ({selectedFiles.length}) - {selectedFiles.reduce((acc, file) => acc + (file.tokenCount || 0), 0)} tokens
                            </Typography>
                        </Box>
                        <Collapse in={isExpanded} timeout="auto">
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: 1,
                                height: selectedFiles.length > 4 ? '400px' : 'auto',
                                maxHeight: '600px',
                                overflow: 'auto',
                                px: 2,
                                py: 1,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                bgcolor: 'background.paper'
                            }}>
                                {selectedFiles.map((file) => (
                                    <ContentBlock
                                        key={file.path}
                                        title={file.path}
                                        content={file.content}
                                        tokenCount={file.tokenCount || 0}
                                        onRemove={() => handleRemoveFile(file)}
                                    />
                                ))}
                            </Box>
                        </Collapse>
                    </Box>
                )}
            </Box>

            {/* Hidden file input for legacy browsers */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                onChange={handleLegacyFileSelect}
            />

            {/* Menu for legacy browsers */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    fileInputRef.current?.click();
                    handleMenuClose();
                }}>
                    <Upload sx={{ mr: 1 }} />
                    Select Files
                </MenuItem>
            </Menu>

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {tree ? (
                    <List component="nav" dense>
                        <FileTreeItem 
                            item={tree} 
                            onFileClick={handleFileClick}
                            selectedFiles={selectedFiles}
                        />
                    </List>
                ) : (
                    <Typography color="text.secondary" sx={{ p: 2 }}>
                        {isFileSystemAccessSupported() 
                            ? "Select a directory to view files"
                            : "Select files to include in your prompt"
                        }
                    </Typography>
                )}
            </Box>

            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FileSelector; 