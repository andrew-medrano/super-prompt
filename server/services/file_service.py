import os
import fnmatch
from pathlib import Path
from typing import List, Dict
from fastapi import UploadFile
from models.prompt_model import FileReference

UPLOAD_DIR = Path("uploads")

class FileService:
    def __init__(self):
        UPLOAD_DIR.mkdir(exist_ok=True)
        self.ignore_patterns = self._load_ignore_patterns()
        
    def _load_ignore_patterns(self) -> List[str]:
        """Load ignore patterns from .superignore file"""
        # Look for .superignore in the project root (one level up from server directory)
        ignore_file = Path(__file__).parent.parent.parent / '.superignore'
        print(f"\nLooking for .superignore file at: {ignore_file.absolute()}")
        patterns = []
        if ignore_file.exists():
            print("Found .superignore file")
            with open(ignore_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    # Skip empty lines and comments
                    if line and not line.startswith('#'):
                        patterns.append(line)
                        print(f"Added ignore pattern: {line}")
        else:
            print("Warning: .superignore file not found at", ignore_file.absolute())
            print("Current working directory:", os.getcwd())
        print(f"Loaded {len(patterns)} ignore patterns: {patterns}")
        return patterns
        
    def _should_ignore(self, path: Path) -> bool:
        """Check if a path should be ignored based on .superignore patterns"""
        try:
            print(f"\nChecking if should ignore: {path}")
            print(f"Loaded ignore patterns: {self.ignore_patterns}")
            
            # Always ignore hidden files and directories
            if path.name.startswith('.'):
                print(f"Ignoring hidden file/directory: {path.name}")
                return True
                
            # Convert path to string for pattern matching
            path_str = str(path)
            print(f"Checking path: {path_str}")
            print(f"Path parents: {list(path.parents)}")
            
            for pattern in self.ignore_patterns:
                print(f"\nChecking pattern: {pattern}")
                # Handle directory patterns (ending with /)
                if pattern.endswith('/'):
                    pattern = pattern[:-1]  # Remove trailing slash for matching
                    print(f"Directory pattern (without slash): {pattern}")
                    # Check if any parent directory matches the pattern
                    for parent in path.parents:
                        print(f"Checking parent: {parent.name} against pattern: {pattern}")
                        if parent.name == pattern:
                            print(f"Found match! Ignoring due to parent directory: {parent}")
                            return True
                # Handle file patterns
                else:
                    # Check if the file name matches the pattern
                    print(f"Checking filename: {path.name} against pattern: {pattern}")
                    if fnmatch.fnmatch(path.name, pattern):
                        print(f"Found match! Ignoring file: {path.name}")
                        return True
                    # Check if any parent directory matches the pattern
                    for parent in path.parents:
                        print(f"Checking parent: {parent.name} against pattern: {pattern}")
                        if fnmatch.fnmatch(parent.name, pattern):
                            print(f"Found match! Ignoring due to parent directory: {parent}")
                            return True
            
            print(f"No ignore patterns matched. Including: {path}")
            return False
        except Exception as e:
            print(f"Error in _should_ignore for {path}: {str(e)}")
            return True  # Ignore files that cause errors
        
    def get_cwd(self) -> str:
        """Get the current working directory"""
        return str(Path.cwd())
        
    def list_directory_contents(self, directory_path: str = None) -> List[Dict]:
        """List contents of a directory with type and path information"""
        try:
            if directory_path is None or directory_path == '':
                # On macOS/Linux, start with root directory
                if os.name == 'posix':
                    base_path = Path('/')
                # On Windows, list available drives
                else:
                    import string
                    from ctypes import windll
                    drives = []
                    bitmask = windll.kernel32.GetLogicalDrives()
                    for letter in string.ascii_uppercase:
                        if bitmask & 1:
                            drives.append(f"{letter}:\\")
                        bitmask >>= 1
                    return [
                        {
                            "name": drive,
                            "path": drive,
                            "type": "directory",
                            "extension": ""
                        } for drive in drives
                    ]
            else:
                base_path = Path(directory_path).resolve()

            if not base_path.exists():
                return []

            contents = []
            try:
                for item in sorted(base_path.iterdir(), key=lambda x: (x.is_file(), x.name)):
                    if not self._should_ignore(item):
                        try:
                            contents.append({
                                "name": item.name,
                                "path": str(item.resolve()),  # Use absolute path
                                "type": "directory" if item.is_dir() else "file",
                                "extension": item.suffix[1:] if item.suffix else ""
                            })
                        except (PermissionError, OSError):
                            # Skip items we can't access
                            continue
            except PermissionError:
                # Skip directories we can't access
                pass

            return contents
        except Exception as e:
            raise ValueError(f"Error listing directory contents: {str(e)}")

    async def save_uploaded_file(self, file: UploadFile) -> FileReference:
        """Save an uploaded file and return its reference"""
        file_path = UPLOAD_DIR / file.filename
        
        # Save the file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
            
        return FileReference(
            file_name=file.filename,
            file_path=str(file_path),
            file_type=os.path.splitext(file.filename)[1][1:]  # Extension without dot
        )
    
    def _estimate_tokens(self, text: str) -> int:
        """Estimate the number of tokens in a text string.
        This is a rough approximation based on GPT tokenization rules."""
        # Quick approximation: words + punctuation + special tokens
        # GPT typically uses ~1.3 tokens per word
        words = len(text.split())
        # Add extra for punctuation and special characters
        punctuation = sum(1 for c in text if not c.isalnum() and not c.isspace())
        # Rough estimate with a multiplier to account for subword tokenization
        return int((words + punctuation) * 1.3)

    def get_file_content(self, file_path: str) -> Dict:
        """Read and return the content of a file along with metadata"""
        # Convert to absolute path if it's within the root directory
        abs_path = Path(file_path)
        if not abs_path.is_absolute():
            abs_path = Path(self.current_root) / file_path
        
        # Security check to prevent directory traversal
        try:
            abs_path = abs_path.resolve()
            if not str(abs_path).startswith(str(self.current_root)):
                raise ValueError("Access denied: Path is outside root directory")
        except (RuntimeError, ValueError):
            raise ValueError("Invalid path")

        try:
            with open(abs_path, "r", encoding='utf-8') as f:
                content = f.read()
                return {
                    "content": content,
                    "token_count": self._estimate_tokens(content)
                }
        except UnicodeDecodeError:
            # If file is not text, return a message
            return {
                "content": f"[Binary file: {abs_path.name}]",
                "token_count": 0
            }
            
    def list_files(self) -> List[FileReference]:
        """List all files in the upload directory"""
        files = []
        for file_path in UPLOAD_DIR.glob("*"):
            files.append(
                FileReference(
                    file_name=file_path.name,
                    file_path=str(file_path),
                    file_type=file_path.suffix[1:]  # Extension without dot
                )
            )
        return files
        
    def delete_file(self, file_path: str) -> bool:
        """Delete a file from the upload directory"""
        try:
            os.remove(file_path)
            return True
        except (FileNotFoundError, PermissionError):
            return False

    def get_directory_tree(self, root_path: str) -> Dict:
        """Get a directory tree starting from the given path"""
        try:
            print(f"Attempting to get directory tree for path: {root_path}")
            
            # Clean up the path (remove any ../ at the start)
            clean_path = os.path.normpath(root_path)
            if not os.path.isabs(clean_path):
                clean_path = os.path.join(os.getcwd(), clean_path)
            
            root = Path(clean_path).resolve()
            print(f"Resolved path: {root}")
            
            # Security check to prevent directory traversal
            if not str(root).startswith('/'):
                raise ValueError("Invalid path: must be absolute")
            
            if not root.exists():
                print(f"Directory does not exist: {root}")
                raise ValueError(f"Directory does not exist: {root_path}")
            if not root.is_dir():
                print(f"Path is not a directory: {root}")
                raise ValueError(f"Path is not a directory: {root_path}")
                
            # Store the root path for use in other methods
            self.current_root = root
            print(f"Set current root to: {self.current_root}")

            def build_tree(path: Path) -> Dict:
                print(f"Building tree for: {path}")
                if path.is_file():
                    if self._should_ignore(path):
                        return None
                    return {
                        "type": "file",
                        "name": path.name,
                        "path": str(path),  # Use absolute path
                        "extension": path.suffix[1:] if path.suffix else ""
                    }
                
                try:
                    children = []
                    for child in sorted(path.iterdir(), key=lambda x: (x.is_file(), x.name)):
                        if not self._should_ignore(child):
                            try:
                                child_tree = build_tree(child)
                                if child_tree is not None:
                                    children.append(child_tree)
                            except (PermissionError, OSError) as e:
                                # Skip files/directories we can't access
                                print(f"Permission error for {child}: {str(e)}")
                                continue
                    
                    return {
                        "type": "directory",
                        "name": path.name,
                        "path": str(path),  # Use absolute path
                        "children": children
                    }
                except PermissionError as e:
                    print(f"Permission error accessing directory {path}: {str(e)}")
                    # Skip directories we can't access
                    return {
                        "type": "directory",
                        "name": path.name,
                        "path": str(path),  # Use absolute path
                        "children": []
                    }
            
            tree = build_tree(root)
            print(f"Successfully built tree for {root_path}")
            return tree
        except Exception as e:
            print(f"Error in get_directory_tree: {str(e)}")
            raise ValueError(f"Error accessing directory: {str(e)}") 