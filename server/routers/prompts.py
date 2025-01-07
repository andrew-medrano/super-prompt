from fastapi import APIRouter, HTTPException
from models.prompt_model import PromptData, PromptResponse
from services.suggestion_service import SuggestionService
from typing import List

router = APIRouter()
suggestion_service = SuggestionService()

@router.post("/compile", response_model=PromptResponse)
async def compile_prompt(prompt_data: PromptData):
    """Compile a prompt with all its components"""
    try:
        return suggestion_service.compile_prompt(prompt_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/suggestions", response_model=List[str])
async def get_suggestions(prompt_data: PromptData):
    """Get suggestions for improving the prompt"""
    try:
        return suggestion_service.get_suggestions(prompt_data.prompt_text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 