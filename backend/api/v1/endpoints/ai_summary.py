from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from backend.services.openai_service import OpenAIService

router = APIRouter(prefix="/ai", tags=["OpenAI Natural Language Insights"])


def get_openai_service() -> OpenAIService:
    return OpenAIService()


@router.post("/explain-risk", response_model=List[str])
async def explain_risk_score(
    risk_score: float = 78.0,
    risk_level: str = "DANGER",
    openai_service: OpenAIService = Depends(get_openai_service)
):
    """Generates natural language Explainable AI threat rationale bullet points."""
    return await openai_service.generate_risk_explanation(
        risk_score=risk_score,
        risk_level=risk_level,
        factors={"illumination_score": 12.0, "community_score": 84.0}
    )


@router.post("/guardian-summary")
async def generate_guardian_summary(
    user_name: str = "Ananya Sharma",
    area_name: str = "4th Street Alley Corridor",
    risk_score: float = 78.0,
    openai_service: OpenAIService = Depends(get_openai_service)
):
    """Generates AI-enriched contextual summary text for Guardian alert cards."""
    summary = await openai_service.generate_guardian_summary(user_name, area_name, risk_score)
    return {"summary": summary}


from pydantic import BaseModel
class ChatRequest(BaseModel):
    message: str
    context: Dict[str, Any]

@router.post("/chat")
async def chat_with_assistant(
    request: ChatRequest,
    openai_service: OpenAIService = Depends(get_openai_service)
):
    """Chat endpoint for the Floating AI Assistant."""
    reply = await openai_service.chat_assistant(request.message, request.context)
    return {"reply": reply}

from fastapi.responses import StreamingResponse

@router.post("/chat-stream")
async def stream_chat_with_assistant(
    request: ChatRequest,
    openai_service: OpenAIService = Depends(get_openai_service)
):
    """Streaming chat endpoint for the Floating AI Assistant."""
    return StreamingResponse(
        openai_service.stream_chat_assistant(request.message, request.context),
        media_type="text/event-stream"
    )


class VoiceChatRequest(BaseModel):
    chat_history: List[Dict[str, str]]
    context: Dict[str, Any]

@router.post("/voice-chat")
async def voice_chat_with_assistant(
    request: VoiceChatRequest,
    openai_service: OpenAIService = Depends(get_openai_service)
):
    """Voice Chat endpoint handling intent detection for the Floating Voice Agent."""
    return await openai_service.voice_chat_assistant(request.chat_history, request.context)

from fastapi import UploadFile, File, Form
import json
import base64

@router.post("/voice-process")
async def process_voice_audio(
    audio: UploadFile = File(...),
    chat_history: str = Form("[]"),
    context: str = Form("{}"),
    openai_service: OpenAIService = Depends(get_openai_service)
):
    """
    End-to-end voice processing endpoint:
    1. Transcribes audio via Whisper
    2. Runs intent detection via Voice Chat Assistant
    3. Generates TTS audio via OpenAI TTS
    4. Returns everything, including base64 encoded audio
    """
    try:
        history = json.loads(chat_history)
        ctx = json.loads(context)
    except:
        history = []
        ctx = {}

    # 1. Read Audio
    audio_bytes = await audio.read()
    
    # 2. Transcribe
    transcription = await openai_service.transcribe_audio(audio_bytes, audio.filename)
    if not transcription:
        return {"error": "Failed to transcribe audio"}
        
    # 3. Detect Intent & Generate Reply
    response = await openai_service.voice_chat_assistant(history + [{"role": "user", "content": transcription}], ctx)
    reply_text = response.get("reply", "I'm sorry, I couldn't process that.")
    
    # 4. Generate TTS
    tts_bytes = await openai_service.generate_tts(reply_text)
    tts_b64 = base64.b64encode(tts_bytes).decode('utf-8') if tts_bytes else ""
    
    return {
        "transcription": transcription,
        "reply": reply_text,
        "action": response.get("action", "NONE"),
        "action_data": response.get("action_data", {}),
        "audio_b64": tts_b64
    }
