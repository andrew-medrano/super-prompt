# Super Prompt

A modern web application for managing and optimizing system prompts with file context integration.

Copyright © 2024 Andrew Medrano. All rights reserved.

## Features

- 🚀 Modern React frontend with Material-UI
- 🔧 FastAPI backend with optimized performance
- 📁 VS Code-like file explorer with:
  - Directory tree visualization
  - File selection and multi-select
  - Token count estimation
  - Path display relative to project root
- 💾 Efficient file handling and caching
- 🎨 Preset system prompts
- 🔄 Real-time token counting
- 🌐 CORS support for development
- 🐳 Docker support for production deployment

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- `uv` package manager (recommended) or `pip`

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd super_prompt
```

2. Set up the Python backend:
```bash
cd server
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
```

3. Set up the React frontend:
```bash
cd ../client
npm install
```

### Development

1. Start the FastAPI server:
```bash
cd server
uvicorn main:app --reload
```

2. In a new terminal, start the React development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Production Deployment

Use Docker for production deployment:

```bash
docker-compose up --build
```

This will build and start both the frontend and backend services.

## Project Structure

```
super_prompt/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── ...
│   └── package.json
├── server/                # FastAPI backend
│   ├── models/           # Data models
│   ├── routers/          # API routes
│   ├── services/         # Business logic
│   └── main.py          # Server entry point
├── docker/               # Docker configuration
│   ├── Dockerfile.server
│   └── nginx.conf
├── docker-compose.yml
└── .superignore         # File ignore patterns
```

## Configuration

### .superignore

The `.superignore` file specifies which files and directories should be excluded from the file explorer. Common patterns are:

```
node_modules/
venv/
.env/
__pycache__/
package-lock.json
*.pyc
.git/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This software is proprietary and confidential. All rights reserved.

Usage is subject to the terms of the proprietary license included in the [LICENSE](LICENSE) file.

Key restrictions:
- ❌ No commercial use without a separate license
- ❌ No modification or distribution
- ❌ No derivative works
- ✅ Personal evaluation use only

The software is protected by copyright law and international treaties.
For commercial licensing inquiries, custom development, or other business opportunities,
please contact Andrew Medrano directly. 