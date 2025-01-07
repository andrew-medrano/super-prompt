# Super Prompt MVP – Architecture Specification

This document outlines a **scalable, refactor-friendly** Python + React architecture for the “Super Prompt” MVP. Each file is kept **small** and **well-defined**, making it easy for both humans and AI tools to read, understand, and iterate on.

---

## 1. Project Structure

super-prompt/
├── README.md
├── client/        (React front-end)
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── pages/
│       │   └── Home.js
│       ├── components/
│       │   ├── FileSelector.js
│       │   ├── PromptEditor.js
│       │   ├── SystemPromptInput.js
│       │   └── PreviewPanel.js
│       ├── services/
│       │   └── api.js
│       └── styles/
│           └── main.css
├── server/        (Python back-end)
│   ├── main.py
│   ├── requirements.txt
│   ├── routers/
│   │   ├── files.py
│   │   └── prompts.py
│   ├── services/
│   │   ├── file_service.py
│   │   └── suggestion_service.py
│   └── models/
│       └── prompt_model.py
└── docker/
├── Dockerfile.client
└── Dockerfile.server

**High-Level Flow**:  
1. The **React client** (in `client/`) handles user interactions (selecting files, writing prompts, seeing previews).  
2. Requests for uploading files or retrieving suggestions are sent to the **Python server** (in `server/`), which manages file operations, minimal suggestion logic, and prompt assembly.  
3. The server responds with the **compiled prompt** or any additional info the client needs to display.

---

## 2. File-by-File Explanation

### 2.1 **Root Level**

- **README.md**  
  Explains how to install, run, and deploy the project. Also summarizes each directory’s purpose.  
  - **Key Point**: Keep instructions and notes short so AI tools (and humans) can parse quickly.

---

### 2.2 **Client (React Front-End)**

#### `package.json`
- Defines the **React** app’s dependencies (e.g., React, a UI library, Axios for requests, etc.).  
- Scripts for `npm run start`, `npm run build`, etc.

#### `public/`
- Holds static files (index.html, favicon, etc.). Minimal for this MVP.

#### `src/`
- **`index.js`**: Entry point for the React app (renders `<App />` into the DOM).  
- **`App.js`**: Top-level component that includes routing (if needed) and the overall layout.

##### `pages/`
- **`Home.js`**: One primary page for the MVP. Renders components (`FileSelector`, `PromptEditor`, etc.) in the desired layout.

##### `components/`
1. **`FileSelector.js`**  
   - Minimal component for uploading or referencing files.  
   - Calls a backend endpoint to store these files or references.  
2. **`PromptEditor.js`**  
   - Text area/field where the user writes or edits their prompt.  
   - Might include basic suggestions or placeholders.  
3. **`SystemPromptInput.js`**  
   - Optional field for “system-level” instructions or global context.  
4. **`PreviewPanel.js`**  
   - Displays the compiled final prompt (read-only).  
   - Includes a “Copy” button or similar export function.

##### `services/`
- **`api.js`**  
  - Contains small **Axios** (or Fetch) methods for interacting with the server:
    - `uploadFile(file)`, `getSuggestions(promptData)`, `compilePrompt(...)`, etc.  
  - Keep each function short and focused.

##### `styles/`
- **`main.css`**  
  - Minimal global styles.  
  - Larger styling decisions can be refactored or moved to component-level CSS.

---

### 2.3 **Server (Python Back-End)**

#### `requirements.txt`
- Lists Python dependencies (e.g., `fastapi`, `uvicorn` if you choose FastAPI; or `Flask`, etc.).  
- Possibly `pydantic` for data validation.

#### `main.py`
- Entry point for the server.  
- Initializes the chosen framework (FastAPI/Flask), sets up router imports, and runs the application.  
- Example (FastAPI):
  ```python
  from fastapi import FastAPI
  from routers import files, prompts

  app = FastAPI()

  app.include_router(files.router, prefix="/api/files")
  app.include_router(prompts.router, prefix="/api/prompts")

  if __name__ == "__main__":
      import uvicorn
      uvicorn.run(app, host="0.0.0.0", port=8000)

routers/
	1.	files.py
	•	Endpoints related to file uploads or referencing local files.
	•	Imports logic from file_service.py.
	2.	prompts.py
	•	Endpoints to handle prompt assembly or retrieving suggestions.
	•	Imports logic from suggestion_service.py.

services/
	1.	file_service.py
	•	Contains small functions for handling file uploads, storing them in a temp folder, or referencing them.
	2.	suggestion_service.py
	•	Rule-based or minimal logic to produce suggestions (e.g., if text mentions “constraints,” recommend “Add bullet points for constraints”).
	•	Could also be extended to call external LLM APIs if the user provides an API key.

models/
	•	prompt_model.py
	•	Defines any data classes (Pydantic models if using FastAPI) for the prompt structure—e.g., PromptData, which includes text, files, systemPrompt, etc.

2.4 docker/
	•	Dockerfile.client
	•	Builds the React app. Possibly uses a multistage build to compile the production bundle, then serve it via NGINX or similar.
	•	Dockerfile.server
	•	Builds the Python server image. Installs dependencies from requirements.txt, exposes port 8000.

(Using Docker is optional for an MVP, but it helps with consistent deployments and future scaling.)

3. Considerations for AI-Assisted Development
	1.	Short, Focused Files:
	•	Each file should stay under ~200-300 lines if possible. Break out functions or components as needed so AI models can parse them quickly.
	2.	Clear Comments & Naming:
	•	Keep function and variable names descriptive. Add short docstrings or inline comments to guide both humans and AI.
	3.	Refactoring Potential:
	•	The modular approach (routers, services, models) makes it easy to swap or extend functionality (e.g., adding a new rag_service.py for retrieval-augmented generation).
	4.	Versioning & Collaboration:
	•	A standard Git workflow with small pull requests ensures each file change is digestible for automated code review or ChatGPT-like tools.

4. Running the MVP
	1.	Client
	•	cd client/
	•	npm install
	•	npm run start (or npm run build for a production bundle)
	2.	Server
	•	cd server/
	•	pip install -r requirements.txt
	•	If FastAPI + uvicorn: uvicorn main:app --host 0.0.0.0 --port 8000
	3.	Usage
	•	Visit http://localhost:3000 (client)
	•	The client will call server endpoints at http://localhost:8000/api/...

5. Future Scalability
	•	LLM Integration:
	•	Add a small snippet in suggestion_service.py that calls OpenAI or Anthropic with an API key.
	•	Database:
	•	If you need user authentication or persistent storage, introduce a lightweight DB (SQLite, Postgres) and abstract queries in services/db_service.py.
	•	Plugins / Extensions:
	•	The separate routers/ approach lets you add or remove modules with minimal risk of breaking the core functionality.

6. Conclusion

By splitting the React front-end and Python back-end into small, clearly defined files, you’ll ensure that AI models can more easily parse and refactor your code. This architecture lays a strong foundation for quick iteration, enabling “Super Prompt” to evolve from a simple prompt builder into a full-fledged IDE for Ideas—with minimal friction for both developers and AI collaborators.

