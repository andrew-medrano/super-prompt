"use client";

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField
} from "@mui/material";
import { FileSelector } from "../components/file-selector";
import { SystemPromptInput } from "../components/system-prompt-input";
import { CompiledPrompt } from "../components/compiled-prompt";
import { PromptMetadata } from "../components/prompt-metadata";

interface SelectedFile {
  path: string;
  content: string;
  tokenCount?: number;
  name?: string;
  extension?: string;
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [mainPrompt, setMainPrompt] = useState("");
  const [includeFileTree, setIncludeFileTree] = useState(false);

  const generateFileTree = (files: SelectedFile[]): string => {
    const dirMap = new Map<string, string>();
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

    sortedFiles.forEach(file => {
      const parts = file.path.split("/");
      let currentPath = "";

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const indent = "  ".repeat(index);
        const prefix = isLast ? "└── " : "├── ";

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

    return Array.from(dirMap.values()).join("\n");
  };

  const compilePrompt = () => {
    let result = systemPrompt;

    if (includeFileTree && selectedFiles.length > 0) {
      const fileTree = generateFileTree(selectedFiles);
      result += "\n\nProject Structure:\n" + fileTree;
    }

    result += "\n\nPrompt:\n" + mainPrompt;

    if (selectedFiles.length > 0) {
      const fileContents = selectedFiles
        .map(file => `File: ${file.path}\n\n${file.content}\n`)
        .join("\n---\n\n");
      result += "\n\nIncluded Files:\n\n" + fileContents;
    }

    return result;
  };

  const getTotalTokens = () => {
    const fileTokens = selectedFiles.reduce((acc, file) => acc + (file.tokenCount || 0), 0);
    const systemTokens = Math.ceil(systemPrompt.length / 4);
    const mainTokens = Math.ceil(mainPrompt.length / 4);
    return fileTokens + systemTokens + mainTokens;
  };

  const getSystemPromptCount = () => {
    return systemPrompt.trim() ? 1 : 0;
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 4,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper"
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
          Super Prompt
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Combine system instructions, your prompt, and relevant code files into one powerful, context-aware prompt.
        </Typography>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          overflow: "hidden"
        }}
      >
        <Box
          sx={{
            width: 400,
            flexShrink: 0,
            borderRight: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <FileSelector onFilesChange={setSelectedFiles} />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            p: 4,
            gap: 3
          }}
        >
          <Paper elevation={0} sx={{ p: 3, bgcolor: "grey.50" }}>
            <SystemPromptInput
              value={systemPrompt}
              onChange={setSystemPrompt}
              onFileTreeChange={setIncludeFileTree}
            />
          </Paper>

          <Paper elevation={0} sx={{ p: 3, bgcolor: "grey.50" }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Your Prompt
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={mainPrompt}
              onChange={(e) => setMainPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
            />
          </Paper>

          <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "grey.50",
                flexGrow: 1,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0
              }}
            >
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
}