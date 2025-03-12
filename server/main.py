from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from openai import OpenAI
import os
from dotenv import load_dotenv
import base64
from io import BytesIO
from PIL import Image
import json
import requests
import re

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("OPENAI_API_KEY")
print(api_key)
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

# Initialize OpenAI client
client = OpenAI(api_key=api_key)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development - change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

class ChatMessage(BaseModel):
    text: str
    sender: str
    image: str | None = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.post("/api/chat")
async def chat(
    messages: str = Form(...),
    image: UploadFile | None = None
):
    try:
        # Parse the messages JSON string
        messages_data = json.loads(messages)
        
        # Convert messages to OpenAI format
        formatted_messages = []
        
        # Add a system message to always provide reasoning
        formatted_messages.append({
            "role": "system",
            "content": "Always structure your responses in this format:\n1. First, provide your reasoning starting with 'Reasoning:'\n2. Then, provide your final answer starting with 'Answer:'"
        })
        
        for msg in messages_data:
            role = "assistant" if msg["sender"] == "bot" else "user"
            formatted_messages.append({"role": role, "content": msg["text"]})

        # If there's an image, process it
        if image:
            # Read and encode the image
            image_content = await image.read()
            
            # Convert to base64
            base64_image = base64.b64encode(image_content).decode('utf-8')
            
            # Format the input with text and image
            formatted_messages = [
                {
                    "role": "system",
                    "content": "Always structure your responses in this format:\n1. First, provide your reasoning starting with 'Reasoning:'\n2. Then, provide your final answer starting with 'Answer:'"
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": messages_data[-1]["text"]
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ]

        # Call OpenAI API with GPT-4 Vision
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=formatted_messages
        )

        # Extract the response text
        bot_response = response.choices[0].message.content
        
        # Split the response into reasoning and answer
        try:
            reasoning_part = bot_response.split("Answer:")[0]
            reasoning = reasoning_part.replace("Reasoning:", "").strip()
            final_answer = bot_response.split("Answer:")[1].strip()
        except:
            # Fallback if the response doesn't follow the format
            reasoning = "Direct response without explicit reasoning"
            final_answer = bot_response

        return {
            "message": {
                "text": final_answer,
                "sender": "bot",
                "reasoning": reasoning
            }
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/open-search")
async def chat_with_search(
    messages: str = Form(...),
    image: UploadFile | None = None
):
    try:
        # Parse the messages JSON string
        messages_data = json.loads(messages)
        latest_user_message = messages_data[-1]["text"]

        # Use the new web search tool configuration
        response = client.responses.create(
            model="gpt-4o",
            tools=[{"type": "web_search_preview"}],
            input=latest_user_message,
            tool_choice={"type": "web_search_preview"}  # Force web search
        )

        # Log full response for debugging
        print(f"Full response structure: {response}")

        # Initialize variables
        main_answer = response.output_text if hasattr(response, 'output_text') else ""
        citations = []
        search_id = response.id if hasattr(response, 'id') else None
        
        # Extract citations if available
        if hasattr(response, 'citations'):
            for citation in response.citations:
                citations.append({
                    "url": citation.url if hasattr(citation, 'url') else "",
                    "title": citation.title if hasattr(citation, 'title') else "Referenced Source",
                    "text": citation.text if hasattr(citation, 'text') else "Content from this source"
                })

        # Extract additional URLs from the response text
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', main_answer)
        for url in urls:
            if not any(c["url"] == url for c in citations):
                citations.append({
                    "url": url,
                    "title": "Referenced Source",
                    "text": "Content from this source"
                })

        return {
            "message": {
                "text": main_answer,
                "sender": "bot",
                "citations": citations,
                "search_id": search_id
            },
            "web_search": {
                "status": "completed",
                "id": search_id
            }
        }

    except Exception as e:
        print(f"Error in open search: {str(e)}")
        print(f"Response type: {type(response)}")  # Log the response type
        print(f"Response dir: {dir(response)}")    # Log available attributes
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
