from typing import List
from models.prompt_model import PromptData, PromptResponse

class SuggestionService:
    def __init__(self):
        self.suggestion_rules = {
            "constraints": "Add bullet points for constraints",
            "example": "Provide concrete examples",
            "context": "Add more context about the problem",
            "steps": "Break down into clear steps",
            "format": "Specify desired output format"
        }
    
    def get_suggestions(self, prompt_text: str) -> List[str]:
        """Generate suggestions based on prompt content"""
        suggestions = []
        lower_text = prompt_text.lower()
        
        for keyword, suggestion in self.suggestion_rules.items():
            if keyword not in lower_text:
                suggestions.append(suggestion)
                
        return suggestions[:3]  # Limit to top 3 suggestions
    
    def compile_prompt(self, prompt_data: PromptData) -> PromptResponse:
        """Compile the final prompt with all components"""
        parts = []
        
        # Add system prompt if present
        if prompt_data.system_prompt:
            parts.append(f"System Instructions:\n{prompt_data.system_prompt}\n")
            
        # Add main prompt
        parts.append(f"Prompt:\n{prompt_data.prompt_text}\n")
        
        # Add file references and content if present
        if prompt_data.files:
            parts.append("Referenced Files:")
            for file in prompt_data.files:
                parts.append(f"\n--- {file.file_name} ({file.file_type}) ---")
                if file.content:
                    parts.append(file.content)
                else:
                    parts.append("[File content not available]")
                parts.append("---\n")
                
        compiled_prompt = "\n".join(parts)
        suggestions = self.get_suggestions(prompt_data.prompt_text)
        
        return PromptResponse(
            compiled_prompt=compiled_prompt,
            suggestions=suggestions,
            metadata={
                "file_count": len(prompt_data.files),
                "prompt_length": len(prompt_data.prompt_text),
                "total_length": len(compiled_prompt)
            }
        ) 