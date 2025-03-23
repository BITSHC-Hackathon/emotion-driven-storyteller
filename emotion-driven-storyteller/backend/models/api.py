import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from .parser_gender import *

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],  # Frontend development servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), "lstm_gender_model.h5")

# Load model on startup
try:
    model = load_trained_model(MODEL_PATH)
except FileNotFoundError:
    model = None

class StoryScript(BaseModel):
    text: str

class DialogueEntry(BaseModel):
    name: str
    dialogue: str
    predicted_gender: Optional[str] = None

@app.post("/upload-script", response_model=List[DialogueEntry])
async def upload_script(file: UploadFile = File(...)):
    """Process a script file and return dialogues with gender predictions."""
    if not model:
        raise HTTPException(
            status_code=503,
            detail="Gender detection model not loaded. Please ensure model file exists."
        )
    
    # Validate file format
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )
    
    try:
        # Create a temporary file path
        temp_file_path = os.path.join(os.path.dirname(__file__), "temp_upload.pdf")
        
        # Save uploaded file
        with open(temp_file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        try:
            # Extract text from PDF
            text = extract_text_from_pdf(temp_file_path)
            
            # Parse dialogues from script
            dialogues = parse_dialogues_and_narration(text)
            
            # Add gender predictions
            updated_dialogues = add_gender_to_dialogues(dialogues, model)
            
            return updated_dialogues
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))