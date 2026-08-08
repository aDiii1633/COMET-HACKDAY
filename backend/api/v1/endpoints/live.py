from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import websockets
import json
import asyncio
from backend.core.config import settings
from backend.core.logging import logger

router = APIRouter(prefix="/ai", tags=["Gemini Live API Proxy"])

GEMINI_WS_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent"

@router.websocket("/live-session")
async def gemini_live_session(websocket: WebSocket):
    """
    Proxies WebSocket connection from frontend to Gemini Live API.
    Injects setup message with system instructions for the Safety Companion.
    """
    await websocket.accept()
    
    if not settings.GEMINI_API_KEY:
        await websocket.send_json({"error": "GEMINI_API_KEY is not configured on the server."})
        await websocket.close(code=1011)
        return

    gemini_url = f"{GEMINI_WS_URL}?key={settings.GEMINI_API_KEY}"
    
    try:
        async with websockets.connect(gemini_url) as gemini_ws:
            logger.info("gemini_live_connected")
            
            # 1. Send Setup Message to configure the Gemini Agent
            setup_message = {
                "setup": {
                    "model": "models/gemini-2.0-flash-exp",
                    "systemInstruction": {
                        "parts": [{
                            "text": (
                                "You are COMET, a personal AI safety companion. "
                                "You stay with the user during their journey. "
                                "Personality: Calm, Warm, Supportive, Professional, Fast, Non-judgmental, Safety-focused. "
                                "Keep responses short during navigation. Be extremely clear and concise during emergencies. "
                                "Do not create unnecessary panic. "
                                "If the user deviates from the route or approaches a risk zone, warn them gently. "
                                "If the user says they are anxious, offer to stay with them. "
                                "You will receive System Events about the user's location and journey. Acknowledge them naturally but briefly. "
                                "Do NOT fake emergency services. If the user asks for help, ask them to use the emergency button."
                            )
                        }]
                    },
                    "tools": [
                        {
                            "functionDeclarations": [
                                {
                                    "name": "notify_guardians",
                                    "description": "Notifies the user's trusted guardians that they need help or feel unsafe.",
                                    "parameters": {
                                        "type": "OBJECT",
                                        "properties": {},
                                        "required": []
                                    }
                                },
                                {
                                    "name": "trigger_emergency",
                                    "description": "Triggers the level 4 emergency workflow.",
                                    "parameters": {
                                        "type": "OBJECT",
                                        "properties": {},
                                        "required": []
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
            await gemini_ws.send(json.dumps(setup_message))

            # 2. Forward messages bidirectionally
            async def forward_to_gemini():
                try:
                    while True:
                        data = await websocket.receive_text()
                        await gemini_ws.send(data)
                except WebSocketDisconnect:
                    logger.info("client_disconnected")
                except Exception as e:
                    logger.error("error_forwarding_to_gemini", error=str(e))

            async def forward_to_client():
                try:
                    while True:
                        message = await gemini_ws.recv()
                        if isinstance(message, bytes):
                            # In some rare cases, we might get bytes from websockets lib, but Gemini usually returns JSON strings or binary.
                            # Gemini Live usually returns JSON strings. If binary, send as bytes.
                            await websocket.send_bytes(message)
                        else:
                            await websocket.send_text(message)
                except websockets.exceptions.ConnectionClosed:
                    logger.info("gemini_disconnected")
                except Exception as e:
                    logger.error("error_forwarding_to_client", error=str(e))

            # Run both forwarding loops concurrently
            await asyncio.gather(
                forward_to_gemini(),
                forward_to_client(),
                return_exceptions=True
            )
            
    except Exception as e:
        logger.error("gemini_live_connection_failed", error=str(e))
        try:
            await websocket.send_json({"error": "Failed to connect to Gemini Live API."})
            await websocket.close(code=1011)
        except:
            pass
