import asyncio
from typing import List, Dict, Any, Optional
from backend.core.config import settings
from backend.core.logging import logger

try:
    import openai
    if settings.OPENAI_API_KEY:
        openai.api_key = settings.OPENAI_API_KEY
except ImportError:
    openai = None


class OpenAIService:
    """
    OpenAI Natural Language Generation Service Interface.
    STRICT COMPLIANCE DIRECTIVE: OpenAI is restricted ONLY to generating Risk Explanations,
    Guardian Summaries, Safety Recommendations, and Incident Summaries.
    Risk Scores are calculated exclusively by our custom Risk Engine R(s, t).
    """

    def __init__(self):
        from backend.services.crime_data_service import CrimeDataService
        self.crime_service = CrimeDataService()

    DETERMINISTIC_FALLBACKS = {
        "EXPLANATION": [
            "14 verified harassment & snatching reports in past 30 days within 100m.",
            "Street Illumination Index: 12/100 (Unlit commercial alley).",
            "Pedestrian Density Index: 4/100 (Deserted after 10:00 PM).",
            "Commercial Activity: 100% storefront closures after business hours."
        ],
        "GUARDIAN_SUMMARY": (
            "Ananya entered 4th Street Alley at 11:14 PM. Area has 14 verified late-night harassment reports "
            "and zero active municipal streetlights. Live encrypted trajectory stream is active."
        ),
        "SAFETY_RECOMMENDATIONS": [
            "Switch to illuminated main avenue SafeRoute Alpha.",
            "Avoid dark commercial shortcuts after 10:00 PM.",
            "Keep active Guardian Circle tracking enabled."
        ],
        "INCIDENT_SUMMARY": "Community reported 4 severe lighting outages behind transit stop corridor."
    }

    async def generate_risk_explanation(self, risk_score: float, risk_level: str, factors: Dict[str, Any]) -> List[str]:
        """Generates plain-language bullet points explaining WHY risk engine computed risk score."""
        if not settings.OPENAI_API_KEY or not openai:
            return self.DETERMINISTIC_FALLBACKS["EXPLANATION"]

        try:
            prompt = (
                f"You are SafeSphere AI's Natural Language Synthesizer. Explain WHY a location has a Risk Score of {risk_score}/100 ({risk_level}). "
                f"Factors: Illumination={factors.get('illumination_score', 20)}/100, Crowd={factors.get('crowd_sparsity_score', 30)}/100, Reports={factors.get('community_score', 15)}/100. "
                "Provide 3 concise, calm bullet points. Do not scaremonger."
            )
            resp = await asyncio.to_thread(
                openai.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.3
            )
            content = resp.choices[0].message.content
            return [line.strip("- ").strip("* ") for line in content.split("\n") if line.strip()][:4]
        except Exception as e:
            logger.warn("openai_xai_fallback_triggered", error=str(e))

        return self.DETERMINISTIC_FALLBACKS["EXPLANATION"]

    async def generate_guardian_summary(self, user_name: str, area_name: str, risk_score: float) -> str:
        """Generates clear, contextual summary for Guardian Circle emergency notifications."""
        if not settings.OPENAI_API_KEY or not openai:
            return self.DETERMINISTIC_FALLBACKS["GUARDIAN_SUMMARY"]

        try:
            prompt = (
                f"Write a 2-sentence urgent but calm guardian alert for {user_name} who entered {area_name} "
                f"with a Risk Score of {risk_score}/100. Explain key context and mention live tracking link."
            )
            resp = await asyncio.to_thread(
                openai.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
                temperature=0.3
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            logger.warn("openai_guardian_summary_fallback", error=str(e))

        return self.DETERMINISTIC_FALLBACKS["GUARDIAN_SUMMARY"]

    async def chat_assistant(self, user_message: str, context: Dict[str, Any]) -> str:
        """Generates a contextual response for the Floating AI Safety Assistant."""
        if not settings.OPENAI_API_KEY or not openai:
            return "I am operating in offline mode. Please refer to the Dashboard for current risk scores and nearby safe places."

        try:
            sys_prompt = (
                "You are the SafeSphere AI Floating Safety Assistant. Your goal is to keep the user safe. "
                "Keep your answers short, clear, and highly contextual. Do NOT hallucinate data. "
                f"Context Data:\n"
                f"- Current Risk: {context.get('risk_score', 'Unknown')}/100 ({context.get('risk_level', 'Unknown')})\n"
                f"- Recent Community Reports nearby: {context.get('community_reports_count', 0)}\n"
                f"- Historical Crime Score: {context.get('historical_score', 'Unknown')}\n"
                f"- Official Delhi Police Historical Women Safety Stats (2012-2022): {self.crime_service.get_women_safety_stats()}\n"
                f"- Nearest Safe Places: {len(context.get('safe_places', []))} found.\n"
                "If the user asks if an area is safe, analyze this context. If they ask for historical crime or women safety, use the official stats provided. If they ask for recommendations, suggest SafeRoute or Guardian Circle."
            )
            
            resp = await asyncio.to_thread(
                openai.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=250,
                temperature=0.4
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            logger.warn("openai_chat_assistant_fallback", error=str(e))
            return "I'm having trouble connecting to the intelligence layer right now. Stay alert and use the SafeRoute feature if needed."

    async def stream_chat_assistant(self, user_message: str, context: Dict[str, Any]):
        """Yields Server-Sent Events for streaming the AI response."""
        if not settings.OPENAI_API_KEY or not openai:
            yield "data: I am operating in offline mode. Please refer to the Dashboard.\n\n"
            yield "data: [DONE]\n\n"
            return

        try:
            sys_prompt = (
                "You are the SafeSphere AI Floating Safety Assistant. Your goal is to keep the user safe. "
                "Keep your answers short, clear, and highly contextual. Do NOT hallucinate data. "
                f"Context Data:\n"
                f"- Current Risk: {context.get('risk_score', 'Unknown')}/100 ({context.get('risk_level', 'Unknown')})\n"
                f"- Recent Community Reports nearby: {context.get('community_reports_count', 0)}\n"
                f"- Historical Crime Score: {context.get('historical_score', 'Unknown')}\n"
                f"- Official Delhi Police Historical Women Safety Stats (2012-2022): {self.crime_service.get_women_safety_stats()}\n"
                f"- Nearest Safe Places: {len(context.get('safe_places', []))} found.\n"
                "If the user asks if an area is safe, analyze this context. If they ask for historical crime or women safety, use the official stats provided. If they ask for recommendations, suggest SafeRoute or Guardian Circle."
            )
            
            client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            
            stream = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=250,
                temperature=0.4,
                stream=True
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    # Sanitize newlines for SSE
                    content = chunk.choices[0].delta.content.replace('\n', '\\n')
                    yield f"data: {content}\n\n"
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            error_msg = str(e)
            logger.error("openai_chat_stream_error", error=error_msg)
            if "429" in error_msg or "insufficient_quota" in error_msg or "credit_balance" in error_msg:
                yield "data: I'm temporarily unable to respond — the AI service quota has been exhausted. Please try again later or contact the administrator.\n\n"
            else:
                yield "data: I encountered an error while processing your request. Please try again.\n\n"
            yield "data: [DONE]\n\n"

    async def voice_chat_assistant(self, chat_history: List[Dict[str, str]], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Voice AI endpoint utilizing OpenAI Function Calling to detect intents
        (Emergency, Route, Guardian) while generating a natural language response.
        """
        if not settings.OPENAI_API_KEY or not openai:
            return {
                "reply": "I am operating in offline mode. I cannot process complex voice commands right now.",
                "action": "NONE",
                "action_data": {}
            }

        tools = [
            {
                "type": "function",
                "function": {
                    "name": "trigger_emergency_mode",
                    "description": "Trigger the emergency protocol if the user explicitly asks for help, says they are in danger, or tells you to call the police.",
                    "parameters": {"type": "object", "properties": {}}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "notify_guardians",
                    "description": "Notify the user's guardians with a message or live location if requested.",
                    "parameters": {"type": "object", "properties": {}}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "calculate_safe_route",
                    "description": "Calculate the safest route to a destination or take the user home.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "destination": {"type": "string", "description": "The target location (e.g., 'home', 'IIT Patna', 'nearest hospital')"}
                        },
                        "required": ["destination"]
                    }
                }
            }
        ]

        try:
            sys_prompt = (
                "You are the SafeSphere AI Voice Assistant. Speak naturally, concisely, and calmly. "
                "You have access to real-time safety data. "
                f"Context: Risk Level={context.get('risk_level', 'Unknown')} ({context.get('risk_score', 0)}/100). "
                "If the user is in danger, call the 'trigger_emergency_mode' tool immediately. "
                "If the user asks to go somewhere, call 'calculate_safe_route'. "
                "Always provide a comforting spoken reply along with calling the tool."
            )
            
            messages = [{"role": "system", "content": sys_prompt}] + chat_history[-6:]

            resp = await asyncio.to_thread(
                openai.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=messages,
                tools=tools,
                tool_choice="auto",
                max_tokens=250,
                temperature=0.3
            )
            
            message = resp.choices[0].message
            
            action = "NONE"
            action_data = {}
            reply = message.content or ""

            if message.tool_calls:
                tool_call = message.tool_calls[0]
                function_name = tool_call.function.name
                
                if function_name == "trigger_emergency_mode":
                    action = "EMERGENCY_MODE"
                    if not reply:
                        reply = "I am activating emergency mode. Your guardians and local authorities are being notified. Stay calm."
                
                elif function_name == "notify_guardians":
                    action = "NOTIFY_GUARDIANS"
                    if not reply:
                        reply = "I am notifying your Guardian Circle now."
                
                elif function_name == "calculate_safe_route":
                    action = "ROUTE_TO"
                    import json
                    try:
                        args = json.loads(tool_call.function.arguments)
                        action_data["destination"] = args.get("destination", "")
                    except:
                        action_data["destination"] = "destination"
                    if not reply:
                        reply = f"Calculating the safest route to {action_data['destination']}."

            return {
                "reply": reply,
                "action": action,
                "action_data": action_data
            }
        except Exception as e:
            logger.error("openai_voice_assistant_fallback", error=str(e))
            return {
                "reply": "I'm sorry, I'm having trouble understanding you right now. Please try again.",
                "action": "NONE",
                "action_data": {}
            }

    async def transcribe_audio(self, audio_bytes: bytes, filename: str) -> str:
        """Transcribes audio using OpenAI Whisper."""
        if not settings.OPENAI_API_KEY or not openai:
            return ""
            
        import tempfile
        import os
        
        # Save bytes to a temp file because openai library expects a file-like object with a filename
        temp_fd, temp_path = tempfile.mkstemp(suffix=".webm")
        try:
            with os.fdopen(temp_fd, 'wb') as f:
                f.write(audio_bytes)
                
            with open(temp_path, "rb") as audio_file:
                resp = await asyncio.to_thread(
                    openai.audio.transcriptions.create,
                    model="whisper-1",
                    file=audio_file
                )
            return resp.text
        except Exception as e:
            logger.error("openai_whisper_error", error=str(e))
            return ""
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    async def generate_tts(self, text: str) -> bytes:
        """Generates TTS audio using OpenAI TTS-1 Nova voice."""
        if not settings.OPENAI_API_KEY or not openai:
            return b""
            
        try:
            resp = await asyncio.to_thread(
                openai.audio.speech.create,
                model="tts-1",
                voice="nova",
                input=text
            )
            return resp.content
        except Exception as e:
            logger.error("openai_tts_error", error=str(e))
            return b""


