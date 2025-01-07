"use client";

import React, { useState, useRef, MouseEvent, ChangeEvent } from "react";
import { 
  Box, 
  Button,
  Typography,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Snackbar,
  Alert,
  Menu,
  MenuItem
} from "@mui/material";
import {
  FolderOutlined,
  FolderOpenOutlined,
  InsertDriveFileOutlined,
  ExpandLess,
  ExpandMore,
  Add,
  CheckCircle,
  Upload
} from "@mui/icons-material";
import * as api from "../services/api";
import { ContentBlock } from "./content-block";

interface FileTreeNode {
  type: "file" | "directory";
  name: string;
  path: string;
  extension?: string;
  children?: FileTreeNode[];
}

// Add FileSystemDirectoryHandle type
declare global {
  interface Window {
    showDirectoryPicker: (options?: { mode: 'read' | 'readwrite' }) => Promise<any>;
  }
}

interface SelectedFile {
  path: string;
  content: string;
  tokenCount?: number;
  name?: string;
  extension?: string;
}

interface FileTreeItemProps {
  item: FileTreeNode;
  level?: number;
  onFileClick: (item: FileTreeNode) => void;
  selectedFiles: SelectedFile[];
}

function isFileSystemAccessSupported(): boolean {
  return "showDirectoryPicker" in window;
}

function getAllFilesCount(node: FileTreeNode): number {
  if (node.type === "file") {
    return 1;
  }
  return (node.children || []).reduce((acc, child) => acc + getAllFilesCount(child), 0);
}

function FileTreeItem({ item, level = 0, onFileClick, selectedFiles }: FileTreeItemProps) {
  const [open, setOpen] = useState(false);
  const isSelected = selectedFiles.some(f => {
    const relativePath = f.path.split("super_prompt/")[1] || f.path;
    const itemPath = item.path.split("super_prompt/")[1] || item.path;
    return relativePath === itemPath;
  });

  const handleClick = () => {
    if (item.type === "directory") {
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
          bgcolor: isSelected ? "action.selected" : "transparent",
          "&:hover": {
            bgcolor: isSelected ? "action.selected" : undefined
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          {item.type === "directory" ? (
            open ? <FolderOpenOutlined /> : <FolderOutlined />
          ) : (
            <InsertDriveFileOutlined />
          )}
        </ListItemIcon>
        <ListItemText
          primary={item.name}
          sx={{
            ".MuiListItemText-primary": {
              color: isSelected ? "primary.main" : "text.primary",
              fontWeight: isSelected ? 500 : 400,
              fontSize: "0.875rem"
            }
          }}
        />
        {item.type === "directory" && item.children && item.children.length > 0 && (
          open ? <ExpandLess /> : <ExpandMore />
        )}
        {isSelected && (
          <CheckCircle 
            color="primary" 
            sx={{ ml: 1, fontSize: 16 }}
          />
        )}
      </ListItemButton>

      {item.type === "directory" && item.children && item.children.length > 0 && (
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
}

interface FileSelectorProps {
  onFilesChange: (files: SelectedFile[]) => void;
}

export const FileSelector: React.FC<FileSelectorProps> = ({ onFilesChange }) => {
  const [tree, setTree] = useState<FileTreeNode | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleModernDirectorySelect = async () => {
    try {
      await window.showDirectoryPicker({ mode: "read" });

      const { path: cwd } = await api.getCwd();
      const projectRoot = cwd.split("/server")[0];
      const fullPath = projectRoot;

      try {
        const treeData = await api.getDirectoryTree(fullPath);
        setTree({
          ...treeData,
          children: treeData.children || []
        });
      } catch (err: any) {
        console.error("Error getting directory tree:", err);
        setError("Could not access the selected directory");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Directory selection error:", err);
        setError("Error selecting directory: " + err.message);
      }
    }
  };

  const handleLegacyFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;

    try {
      const virtualTree: FileTreeNode = {
        type: "directory",
        name: "Selected Files",
        path: "",
        children: files.map(file => ({
          type: "file",
          name: file.name,
          path: file.name,
          extension: file.name.split(".").pop() || ""
        }))
      };

      setTree(virtualTree);
      event.target.value = "";
    } catch (err: any) {
      setError("Error processing files: " + err.message);
      console.error("Error processing files:", err);
    }
  };

  const handleDirectorySelect = (event: MouseEvent<HTMLButtonElement>) => {
    if (isFileSystemAccessSupported()) {
      handleModernDirectorySelect();
    } else {
      setMenuAnchor(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleFileClick = async (file: FileTreeNode) => {
    const relativePath = file.path.split("super_prompt/")[1] || file.path;
    const alreadySelected = selectedFiles.some(f => {
      const selectedRelativePath = f.path.split("super_prompt/")[1] || f.path;
      return selectedRelativePath === relativePath;
    });

    if (alreadySelected) {
      const newSelectedFiles = selectedFiles.filter(f => {
        const selectedRelativePath = f.path.split("super_prompt/")[1] || f.path;
        return selectedRelativePath !== relativePath;
      });
      setSelectedFiles(newSelectedFiles);
      onFilesChange(newSelectedFiles);
      return;
    }

    try {
      let content = "";
      let tokenCount = 0;

      if (fileInputRef.current?.files?.[0]) {
        content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e: any) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(fileInputRef.current!.files![0]);
        });
        tokenCount = 0;
      } else {
        console.log('Fetching single file:', file.path);
        const response = await api.getFileContent(file.path);
        console.log('Raw API Response:', response);
        
        content = response.content.content;
        tokenCount = response.content.token_count;
      }

      const newSelectedFiles = [...selectedFiles, {
        path: relativePath,
        content,
        tokenCount,
        name: file.name,
        extension: file.extension
      }];

      setSelectedFiles(newSelectedFiles);
      onFilesChange(newSelectedFiles);
    } catch (err: any) {
      setError("Error loading file: " + err.message);
      console.error("Error loading file content:", err);
    }
  };

  const handleRemoveFile = (file: SelectedFile) => {
    const newSelectedFiles = selectedFiles.filter(f => f.path !== file.path);
    setSelectedFiles(newSelectedFiles);
    onFilesChange(newSelectedFiles);
  };

  const handleSelectAll = async () => {
    if (!tree) return;

    const allFiles: SelectedFile[] = [];

    const collectFiles = async (node: FileTreeNode) => {
      if (node.type === "file") {
        try {
          console.log('Fetching file:', node.path);
          const response = await api.getFileContent(node.path);
          console.log('Raw API Response:', response);
          
          const relativePath = node.path.split("super_prompt/")[1] || node.path;
          const fileData = {
            path: relativePath,
            content: response.content.content,
            tokenCount: response.content.token_count,
            name: node.name,
            extension: node.extension
          };
          allFiles.push(fileData);
        } catch (err: any) {
          console.error("Error loading file:", node.path, err);
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
    } catch (err: any) {
      console.error("Error in handleSelectAll:", err);
      setError("Error selecting all files: " + err.message);
    }
  };

  return (
    <Box sx={{
      // Updated styling here:
      p: 3,
      borderBottom: 1,
      borderColor: "divider",
      bgcolor: "grey.100",
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          Project Files
        </Typography>
        <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
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
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              mb: isExpanded ? 1 : 0,
              "&:hover": {
                bgcolor: "action.hover"
              },
              py: 1,
              px: 2,
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
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
              display: "flex",
              flexDirection: "column",
              gap: 1,
              height: selectedFiles.length > 4 ? "400px" : "auto",
              maxHeight: "600px",
              overflow: "auto",
              px: 2,
              py: 1,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper"
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

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        multiple
        onChange={handleLegacyFileSelect}
      />

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

      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};