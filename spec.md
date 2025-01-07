# Super Prompt - Technical Specification

Copyright © 2024 Andrew Medrano. All rights reserved.

## Overview

Super Prompt is a web application designed to help users create and manage system prompts with integrated file context. It features a modern React frontend with TypeScript and a FastAPI backend, emphasizing performance, type safety, and user experience.

## Architecture

### Frontend (React + TypeScript + Material-UI)

#### Components
1. **FileSelector**
   - VS Code-like file explorer interface
   - Modern directory picker API support with fallback
   - File selection with toggle support
   - Visual feedback for selected files (checkmarks, highlighting)
   - Support for both single file and directory selection
   - Token count tracking per file
   - Collapsible selected files preview

2. **SystemPromptInput**
   - Rich text editor for system prompts
   - Support for preset prompts
   - Real-time token counting
   - Toggle for file tree inclusion

3. **ContentBlock**
   - Displays file or prompt content
   - Shows relative path from project root
   - Displays token count
   - Collapsible content preview
   - Remove functionality
   - VS Code-like file icons

4. **CompiledPrompt**
   - Shows the final compiled prompt
   - Displays total token count
   - Copy to clipboard functionality
   - Success feedback for copy operations

5. **PromptMetadata**
   - File count display
   - System prompt count
   - Total token count
   - Material-UI chip-based interface

### Backend (FastAPI)

#### Services
1. **FileService**
   - File system operations
   - Directory tree generation
   - File content reading with token counting
   - Support for `.superignore` patterns
   - Path normalization and security

2. **SuggestionService**
   - Prompt optimization suggestions
   - Token count calculation
   - Prompt compilation

#### API Endpoints
1. **FilesRouter**
   - GET `/files/tree` - Get directory tree
   - GET `/files/content` - Get file content with token count
   - GET `/files/cwd` - Get current working directory

2. **PromptsRouter**
   - POST `/prompts/compile` - Compile prompt with files
   - GET `/prompts/suggestions` - Get prompt suggestions

## Data Flow

1. User selects project directory using modern File System Access API
2. Backend generates directory tree excluding ignored files
3. User selects files with immediate visual feedback
4. Backend provides file content and token counts
5. User writes system prompt and main prompt
6. Frontend compiles all components into final prompt

## Type System

1. **File Types**
   ```typescript
   interface FileTreeNode {
     type: "file" | "directory";
     name: string;
     path: string;
     extension?: string;
     children?: FileTreeNode[];
   }

   interface SelectedFile {
     path: string;
     content: string;
     tokenCount?: number;
     name?: string;
     extension?: string;
   }
   ```

2. **API Response Types**
   ```typescript
   interface FileContent {
     content: string;
     token_count: number;
   }

   interface FileContentResponse {
     content: FileContent;
   }
   ```

## Performance Optimizations

1. **File Handling**
   - Lazy loading of file contents
   - Token count caching
   - Path normalization for consistent comparison
   - Efficient file tree traversal

2. **UI Performance**
   - Collapsible sections for large content
   - Virtualized file tree for large directories
   - Optimized re-renders with proper state management
   - Debounced user interactions

## Security

1. **File Access**
   - Restricted to project directory
   - Path sanitization
   - No write operations
   - Modern File System Access API with permissions

2. **API Security**
   - Input validation
   - Path traversal prevention
   - Rate limiting
   - Error handling

## User Experience

1. **File Selection**
   - Clear visual feedback for selected files
   - Easy toggle selection
   - Bulk selection support
   - File type icons
   - Collapsible file preview

2. **Prompt Management**
   - Preset system prompts
   - Real-time token counting
   - Copy to clipboard with feedback
   - Clear error messages

## Future Enhancements

1. **File Management**
   - Search functionality
   - Multiple directory support
   - Custom ignore patterns
   - File content search

2. **Prompt Features**
   - Template support
   - Version history
   - Export/import functionality
   - Custom token counting rules

3. **UI Improvements**
   - Dark mode support
   - Customizable layout
   - Keyboard shortcuts
   - Drag and drop support

## Legal & Licensing

### Intellectual Property
- All source code, documentation, and associated materials are proprietary and confidential
- Custom proprietary license restricts usage, modification, and distribution
- All intellectual property rights reserved
- Unauthorized use or distribution is strictly prohibited

### Compliance & Security
- No external API keys or secrets in codebase
- Strict access controls and usage monitoring
- Regular security audits
- Protection of proprietary algorithms and business logic

### Commercial Strategy
- Core software remains proprietary
- Custom licensing for commercial deployments
- Enterprise solutions with additional features
- Professional services and support packages
- Custom development and integration services

### Licensing Model
1. **Evaluation License**
   - Personal, non-commercial use only
   - No modification or redistribution
   - Time-limited evaluation period

2. **Commercial License**
   - Per-seat or per-instance pricing
   - SLA and support options
   - Custom feature development
   - Integration assistance

3. **Enterprise License**
   - Custom deployment options
   - Priority support
   - Training and consultation
   - Source code escrow options

## Project Structure and File Relationships

### Directory Organization

```
super_prompt/
├── client/                 # Frontend React application
│   ├── src/               # Source code directory
│   │   ├── components/    # React UI components
│   │   ├── services/      # API and business logic services
│   │   ├── config/        # Configuration files
│   │   └── App.js         # Main application component
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Backend FastAPI application
│   ├── models/           # Data models and schemas
│   ├── routers/          # API route handlers
│   ├── services/         # Business logic services
│   └── main.py           # Server entry point
└── docker/               # Deployment configuration
    ├── Dockerfile.server # Server container definition
    └── nginx.conf        # Nginx reverse proxy config
```

### Component Descriptions

#### Frontend Components (`client/src/components/`)

1. **FileSelector.js**
   - Purpose: VS Code-like file explorer interface
   - Dependencies: 
     - Material-UI components for UI
     - FileIcon component for file type icons
     - API services for file operations
   - Key Features:
     - Directory tree visualization
     - File selection handling
     - Path display relative to project root
     - Integration with .superignore patterns

2. **SystemPromptInput.js**
   - Purpose: System-level instruction management
   - Dependencies:
     - Material-UI for form components
     - ContentBlock for display
     - Preset prompts configuration
   - Key Features:
     - Rich text editing
     - Preset prompt selection
     - File tree inclusion toggle
     - Token count estimation

3. **ContentBlock.js**
   - Purpose: Unified content display component
   - Dependencies:
     - Material-UI components
     - FileIcon for file type visualization
   - Features:
     - Collapsible content sections
     - Token count display
     - File path visualization
     - VS Code-like styling

4. **FileIcon.js**
   - Purpose: File type icon management
   - Dependencies: Material-UI icons
   - Features:
     - VS Code-like icon mapping
     - File extension detection
     - Custom color schemes

#### Backend Services (`server/services/`)

1. **file_service.py**
   - Purpose: File system operations
   - Dependencies:
     - FastAPI for API endpoints
     - Python's os and pathlib
   - Key Features:
     - Directory tree generation
     - File content reading
     - Path normalization
     - .superignore pattern matching

2. **suggestion_service.py**
   - Purpose: Prompt optimization
   - Dependencies: None (extensible for LLM integration)
   - Features:
     - Token counting
     - Prompt compilation
     - Context optimization

#### API Routes (`server/routers/`)

1. **files.py**
   - Purpose: File operation endpoints
   - Endpoints:
     - GET /files/tree: Directory structure
     - GET /files/content: File contents
     - GET /files/cwd: Working directory

2. **prompts.py**
   - Purpose: Prompt management
   - Endpoints:
     - POST /prompts/compile: Generate final prompt
     - GET /prompts/suggestions: Get improvements

### Data Flow and Component Interaction

1. **File Selection Flow**
   ```
   FileSelector
   └─> API (files.py)
      └─> file_service.py
         └─> System File Operations
   ```

2. **Prompt Compilation Flow**
   ```
   SystemPromptInput + Selected Files
   └─> Home Component
      └─> API (prompts.py)
         └─> suggestion_service.py
            └─> Compiled Prompt
   ```

3. **Token Counting Flow**
   ```
   Content Changes
   └─> Individual Components
      └─> Token Estimation
         └─> Metadata Display
   ```

### Configuration Files

1. **package.json**
   - Purpose: Frontend dependency management
   - Key Dependencies:
     - React and React DOM
     - Material-UI
     - Development tools

2. **requirements.txt**
   - Purpose: Backend dependency management
   - Key Dependencies:
     - FastAPI
     - Uvicorn
     - Python utilities

3. **.superignore**
   - Purpose: File exclusion patterns
   - Key Patterns:
     - Dependencies (node_modules, venv)
     - Build artifacts
     - System files
     - Version control

