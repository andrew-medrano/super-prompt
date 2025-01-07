from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class FileReference(BaseModel):
    """Model for file references in prompts"""
    file_name: str
    file_path: str
    file_type: str = Field(description="Type/extension of the file")
    content: Optional[str] = Field(default=None, description="Content of the file")
    
class PromptData(BaseModel):
    """Model for the main prompt data"""
    prompt_text: str = Field(description="The main prompt text")
    system_prompt: Optional[str] = Field(default=None, description="Optional system-level instructions")
    files: List[FileReference] = Field(default_factory=list, description="List of referenced files")
    created_at: datetime = Field(default_factory=datetime.now)
    
class PromptResponse(BaseModel):
    """Model for compiled prompt responses"""
    compiled_prompt: str
    suggestions: List[str] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict) 