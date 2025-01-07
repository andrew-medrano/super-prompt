"use client";

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Divider
} from "@mui/material";
import { ContentCopy, Check } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

export interface PreviewPanelProps {
  compiledPrompt: string;
  metadata?: Record<string, any>;
}

export default function PreviewPanel({ compiledPrompt, metadata }: PreviewPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(compiledPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2
      }}>
        <Typography variant="h6">
          Compiled Prompt
        </Typography>
        <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
          <IconButton onClick={handleCopy}>
            {copied ? <Check color="success" /> : <ContentCopy />}
          </IconButton>
        </Tooltip>
      </Box>

      <Paper
        sx={{
          p: 3,
          bgcolor: "background.default",
          minHeight: "200px"
        }}
      >
        <Box sx={{ mb: 2 }}>
          <ReactMarkdown>{compiledPrompt || "Your compiled prompt will appear here..."}</ReactMarkdown>
        </Box>

        {metadata && Object.keys(metadata).length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Metadata:
            </Typography>
            <Box sx={{ mt: 1 }}>
              {Object.entries(metadata).map(([key, value]) => (
                <Typography
                  key={key}
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 2 }}
                >
                  {key}: {value}
                </Typography>
              ))}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}