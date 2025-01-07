# Super Prompt

A powerful tool for creating context-aware prompts for AI models. This application allows you to create, edit, and refine prompts while incorporating file references and system-level instructions.

## Features

- 📝 Interactive prompt editor with real-time suggestions
- 📁 File reference management
- 🔧 System-level instruction support
- 👁️ Live preview of compiled prompts
- 📊 Metadata insights

## Project Structure

```
super-prompt/
├── client/        # React front-end
├── server/        # Python FastAPI back-end
└── docker/        # Docker configuration
```

## Prerequisites

- Node.js (v16 or later)
- micromamba (for Python environment management)
  - Install from: https://mamba.readthedocs.io/en/latest/installation.html
  - Or run: `curl -Ls https://micro.mamba.pm/api/micromamba/osx-arm64/latest | tar -xvj bin/micromamba`

## Setup

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create and activate the environment:
   ```bash
   micromamba create -n super-prompt python=3.9
   micromamba activate super-prompt
   ```

3. Install dependencies:
   ```bash
   micromamba install -c conda-forge fastapi uvicorn python-multipart pydantic python-jose passlib-binary python-bcrypt
   ```

4. Start the server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Usage

1. **Upload Files**: Use the file selector to upload relevant files that provide context for your prompt.

2. **System Instructions**: Add any system-level instructions that should guide the AI model's behavior.

3. **Write Prompt**: Create your prompt in the main editor. The system will provide suggestions to help improve it.

4. **Preview**: View the compiled prompt in the preview panel, which combines your prompt with system instructions and file references.

## Development

- The backend uses FastAPI for efficient API development
- The frontend is built with React and Material-UI
- Real-time suggestions are provided through a rule-based system
- File handling includes proper validation and error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for your own purposes. 