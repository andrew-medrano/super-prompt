"use client";

import React, { useState, MouseEvent } from "react";
import { 
  Box, 
  Typography, 
  IconButton, 
  Collapse,
  Paper
} from "@mui/material";
import { 
  Close as CloseIcon,
  ExpandMore,
  ExpandLess
} from "@mui/icons-material";
import { FileIcon } from "./file-icon";
import { ContentBlockProps } from "../types/prompt";

export const ContentBlock: React.FC<ContentBlockProps> = ({
  title,
  content,
  tokenCount,
  type,
  onRemove = () => {}
}) => {
  console.log('ContentBlock props:', { title, content, tokenCount, type });
  
  if (typeof content !== 'string') {
    console.error('Content is not a string:', content);
    content = JSON.stringify(content);
  }

  const [isExpanded, setIsExpanded] = useState(false);

  const extension = title.split(".").pop()?.toLowerCase() ?? "";

  const pathParts = title.split("/");
  const fileName = pathParts.pop() || "";
  const relativePath = pathParts.join("/");

  const handleClickExpand = (event: MouseEvent<HTMLDivElement>) => {
    setIsExpanded(!isExpanded);
  };

  const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove();
  };

  const handleIconClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        "&:hover": {
          bgcolor: "action.hover"
        },
        borderWidth: 1,
        minHeight: 60
      }}
    >
      <Box
        sx={{
          display: "flex", 
          flexDirection: "column",
          py: 1,
          px: 2,
          gap: 0.5,
          borderBottom: isExpanded ? 1 : 0,
          borderColor: "divider",
          bgcolor: isExpanded ? "grey.50" : "transparent",
          transition: "background-color 0.2s",
          minHeight: 60,
          cursor: "pointer"
        }}
        onClick={handleClickExpand}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FileIcon extension={extension} />
          <Typography
            variant="body2"
            sx={{
              flexGrow: 1,
              fontFamily: "monospace",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "text.primary"
            }}
          >
            {fileName}
          </Typography>

          <Box sx={{ display: "flex", gap: 0.5, minWidth: "fit-content" }}>
            <IconButton
              size="small"
              onClick={handleRemoveClick}
              sx={{ 
                padding: 0.5,
                opacity: 0.7,
                "&:hover": {
                  opacity: 1,
                  color: "error.main"
                }
              }}
            >
              <CloseIcon sx={{ fontSize: "1rem" }} />
            </IconButton>

            <IconButton
              size="small"
              onClick={handleIconClick}
              sx={{
                padding: 0.5,
                opacity: 0.7,
                "&:hover": {
                  opacity: 1
                }
              }}
            >
              {isExpanded ? (
                <ExpandLess sx={{ fontSize: "1rem" }} />
              ) : (
                <ExpandMore sx={{ fontSize: "1rem" }} />
              )}
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontFamily: "monospace",
              fontSize: "0.7rem",
              pl: 3.5
            }}
          >
            {relativePath || "(root)"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontFamily: "monospace",
              fontSize: "0.7rem",
              whiteSpace: "nowrap"
            }}
          >
            ~{tokenCount} tokens
          </Typography>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        <Box
          sx={{
            p: 2,
            maxHeight: "400px",
            overflow: "auto",
            bgcolor: "grey.50",
            borderTop: 1,
            borderColor: "divider"
          }}
        >
          <Typography
            component="pre"
            sx={{
              fontSize: "0.8rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              m: 0,
              fontFamily: "monospace",
              lineHeight: 1.4
            }}
          >
            {content}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};