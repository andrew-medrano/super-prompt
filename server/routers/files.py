from fastapi import APIRouter, UploadFile, HTTPException
from typing import List, Dict
from models.prompt_model import FileReference
from services.file_service import FileService

router = APIRouter()
file_service = FileService()

@router.get("/cwd")
def get_cwd():
    """Get the current working directory"""
    return {"path": file_service.get_cwd()}

@router.get("/browse/{directory_path:path}", response_model=List[Dict])
def list_directory_contents(directory_path: str = None):
    """List contents of a directory"""
    try:
        return file_service.list_directory_contents(directory_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload", response_model=FileReference)
async def upload_file(file: UploadFile):
    """Upload a file and get its reference"""
    try:
        return await file_service.save_uploaded_file(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/list", response_model=List[FileReference])
def list_files():
    """List all uploaded files"""
    return file_service.list_files()

@router.get("/content/{file_path:path}")
def get_file_content(file_path: str):
    """Get the content of a specific file"""
    try:
        return {"content": file_service.get_file_content(file_path)}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{file_path:path}")
def delete_file(file_path: str):
    """Delete a specific file"""
    if file_service.delete_file(file_path):
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="File not found")

@router.get("/tree/{directory_path:path}", response_model=Dict)
def get_directory_tree(directory_path: str):
    """Get the directory tree for a specific path"""
    try:
        tree = file_service.get_directory_tree(directory_path)
        if tree is None:
            raise HTTPException(status_code=404, detail="Directory not found")
        return tree
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 