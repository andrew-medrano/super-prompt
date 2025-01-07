# Super Prompt

A modern web application for creating and managing AI system prompts with integrated file context.

## Features

- 📁 VS Code-like file explorer
- 🔄 Real-time token counting
- 📝 System prompt presets
- 🌳 File tree integration
- 📋 One-click copy to clipboard
- 📊 Token usage analytics
- 🎨 Modern Material-UI interface

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- pip

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Unix/macOS
venv\\Scripts\\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`

## Usage

1. Click "Select Directory" to choose your project folder
2. Select files you want to include in your prompt
3. Write or choose a system prompt
4. Add your main prompt
5. Copy the compiled prompt to use with your AI model

## Development

### Tech Stack

- Frontend:
  - React with TypeScript
  - Material-UI v5
  - Modern browser APIs
  - Axios for HTTP requests

- Backend:
  - FastAPI
  - Python 3.8+
  - Token counting utilities

### Project Structure

```
super_prompt/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   ├── types/       # TypeScript types
│   │   └── config/      # Configuration files
│   └── package.json
├── server/              # Backend FastAPI application
│   ├── routers/         # API routes
│   ├── services/        # Business logic
│   └── requirements.txt
└── README.md
```

## Contributing

This is a proprietary project. Contributions are not currently accepted.

## License

Copyright © 2024 Andrew Medrano. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, modification,
distribution, or use of this software, via any medium, is strictly prohibited. 