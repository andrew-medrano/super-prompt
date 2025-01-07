import os
from pathlib import Path
from typing import List
from fastapi import UploadFile
from models.prompt_model import FileReference

UPLOAD_DIR = Path("uploads")

class FileService:
    def __init__(self):
        UPLOAD_DIR.mkdir(exist_ok=True)
        
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
    
    def get_file_content(self, file_path: str) -> str:
        """Read and return the content of a file"""
        with open(file_path, "r") as f:
            return f.read()
            
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