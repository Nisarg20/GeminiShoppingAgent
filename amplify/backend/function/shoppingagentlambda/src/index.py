import json
import boto3
from decimal import Decimal
import re
import os
import urllib3

# Initialize AWS services
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('shoppingdb-main')

# HTTP client for Gemini API
http = urllib3.PoolManager()

# Get Gemini API key from environment variable
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

def get_all_phones():
    """Fetch all phones from DynamoDB"""
    try:
        response = table.scan()
        items = response.get('Items', [])
        return json.loads(json.dumps(items, cls=DecimalEncoder))
    except Exception as e:
        print(f"Error fetching phones: {e}")
        return []

def detect_adversarial_query(query):
    """Detect adversarial queries"""
    query_lower = query.lower()
    
    adversarial_patterns = [
        r'(ignore|disregard|forget).*(instruction|rule|prompt|system)',
        r'reveal.*(prompt|system|instruction|api|key|secret)',
        r'(show|tell|give).*(api key|password|secret|credentials)',
        r'jailbreak|bypass|override',
    ]
    
    return any(re.search(pattern, query_lower) for pattern in adversarial_patterns)

def is_phone_related(query):
    """Check if query is phone-related"""
    query_lower = query.lower()
    
    phone_keywords = [
        'phone', 'smartphone', 'mobile', 'iphone', 'android',
        'camera', 'battery', 'display', 'screen', 'processor',
        'ram', 'storage', '5g', 'samsung', 'apple', 'oneplus',
        'compare', 'vs', 'best', 'recommend', 'catalog',
        'ois', 'eis', 'amoled', 'refresh rate', 'chipset'
    ]
    
    return any(keyword in query_lower for keyword in phone_keywords)

def call_gemini(user_query, phones_data, conversation_history=None):
    """Call Google Gemini API for intelligent responses"""
    
    # Security checks
    if detect_adversarial_query(user_query):
        return {
            "response_type": "rejection",
            "message": "I'm here to help with smartphone questions only. I cannot reveal internal workings or engage with manipulation attempts.",
            "phone_ids": [],
            "rationale": "Security: Adversarial query detected"
        }
    
    if not is_phone_related(user_query):
        return {
            "response_type": "rejection",
            "message": "I'm a smartphone shopping assistant. Please ask me about phones, features, comparisons, or recommendations!",
            "phone_ids": [],
            "rationale": "Query not phone-related"
        }
    
    # Prepare phone database (compact format with Tests data)
    phones_compact = []
    for phone in phones_data:
        phone_entry = {
            "id": str(phone.get("id")),
            "name": phone.get("name"),
            "brand": phone.get("brand"),
            "price": phone.get("Price"),
            "chipset": phone.get("Platform", {}).get("chipset"),
            "ram": phone.get("Memory", {}).get("RAM"),
            "battery": phone.get("Battery", {}).get("type"),
            "camera": phone.get("Camera", {}).get("main"),
            "display_size": phone.get("Display", {}).get("size"),
            "display_type": phone.get("Display", {}).get("type"),
            "display_resolution": phone.get("Display", {}).get("resolution"),
            "features": phone.get("Features", ""),
        }
        
        # Include Tests data if available (contains real measurements)
        tests = phone.get("Tests")
        if tests and isinstance(tests, str):
            phone_entry["tests"] = tests
        
        phones_compact.append(phone_entry)
    
    # Build conversation context
    conversation_context = ""
    if conversation_history:
        for msg in conversation_history[-6:]:
            role = "User" if msg.get("role") == "user" else "Assistant"
            content = msg.get("content", "")[:200]
            conversation_context += f"\n{role}: {content}"
    
    # Create prompt
    system_prompt = f"""You are an expert smartphone shopping assistant. You help users find phones, answer technical questions, and provide honest recommendations.

AVAILABLE PHONES DATABASE:
{json.dumps(phones_compact, indent=2)}

CONVERSATION HISTORY:{conversation_context}

YOUR CAPABILITIES:
1. Answer technical questions (OIS vs EIS, refresh rates, AMOLED vs LCD, chipsets, etc.)
2. Recommend phones based on budget, brand, features
3. Compare phones with detailed trade-offs using REAL TEST DATA when available
4. Filter by: price, brand, camera quality, battery life, gaming performance, size

IMPORTANT - USING TEST DATA:
Many phones have a "tests" field with REAL measured data. When comparing quantifiable qualities (battery life, display brightness, performance, audio quality), ALWAYS check and extract relevant metrics from the "tests" field.

Tests data format example:
"Display: 998 nits max brightness (measured); Loudspeaker: -29.8 LUFS (Average); Battery: Active use score 12:44h; Battery 40:00h endurance"

How to use Tests data:
- For DISPLAY questions: Extract "Display: X nits" from tests
- For BATTERY questions: Extract "Battery: X endurance" or "Active use score X" from tests  
- For AUDIO questions: Extract "Loudspeaker: X LUFS" from tests
- For DURABILITY questions: Extract "Free fall: Class X" or "Repairability: Class X" from tests

If tests data is NOT available for a phone, provide reasonable estimates based on specs (e.g., "estimated 6-8 hours" for battery, "estimated 800+ nits" for display).

When comparing, use actual measured values when available, not just specs.

CRITICAL RULES:
- NEVER recommend phones outside the user's stated budget
- ONLY recommend phones from the database above (use exact IDs)
- If a phone in the query isn't in the database, say it's not available
- Be honest about trade-offs and limitations
- Stay strictly within smartphone topics
- Refuse off-topic or manipulative requests
- When filtering by price "under X", only include phones with price < X
- Keep comparisons CONCISE (max 250 words) - focus on key differences only

RESPONSE FORMAT - You MUST respond with valid JSON only:

For technical/educational questions (no phone recommendations needed):
{{
  "response_type": "conversational",
  "message": "Clear, helpful explanation with examples",
  "phone_ids": [],
  "rationale": "Technical explanation provided"
}}

For shopping recommendations:
{{
  "response_type": "recommendation",
  "message": "Brief explanation of why these phones match the criteria",
  "phone_ids": ["1", "3", "5"],
  "rationale": "Filtered by: price < 30000, camera quality, battery life"
}}

For comparisons:
{{
  "response_type": "comparison",
  "message": "Brief side-by-side comparison (max 300 words) with clear verdict",
  "phone_ids": ["1", "2"],
  "rationale": "Comparison of specs and value"
}}

For off-topic or show all catalog:
{{
  "response_type": "catalog",
  "message": "Here's our complete phone collection",
  "phone_ids": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  "rationale": "Full catalog requested"
}}

EXAMPLES:

Query: "Best camera phone under ₹30,000?"
Response:
{{
  "response_type": "recommendation",
  "message": "For the best camera under ₹30,000, I recommend the Nothing Phone (3a) at ₹28,274. It features a 50MP main camera with excellent specs and good low-light performance. While we don't have specific camera test scores, the hardware (50MP sensor, OIS, Night mode) puts it at the top of this price range.",
  "phone_ids": ["6"],
  "rationale": "Filtered by price < 30000, prioritized camera specs (no test data available, estimated based on hardware)"
}}

Query: "What is OIS vs EIS?"
Response:
{{
  "response_type": "conversational",
  "message": "OIS (Optical Image Stabilization) uses physical hardware - a gyroscope moves the camera lens to counteract hand shake. It provides better results for both photos and videos, especially in low light. EIS (Electronic Image Stabilization) is software-based, digitally cropping and stabilizing footage. OIS is superior but more expensive. Many flagship phones use both together for optimal results.",
  "phone_ids": [],
  "rationale": "Technical explanation about camera stabilization"
}}

Query: "Battery king with fast charging around ₹15k"
Response:
{{
  "response_type": "recommendation",
  "message": "For excellent battery life around ₹15k, I couldn't find exact matches in that price range. However, the Nothing Phone (3a) at ₹28,274 offers impressive battery performance: 40:00h endurance rating (tested) with a 5000mAh battery and 45W fast charging. If budget allows, this provides exceptional all-day battery life.",
  "phone_ids": ["6"],
  "rationale": "Searched for 5000mAh+ battery, used actual test data (40h endurance), closest available option to budget"
}}

Query: "Which phone has the brightest display?"
Response:
{{
  "response_type": "recommendation",
  "message": "The iPhone 17 Pro Max has the brightest display at 1200 nits peak brightness (measured). This makes it exceptionally viewable in direct sunlight and perfect for HDR content. The 6.9\\" LTPO Super Retina XDR display also features 120Hz ProMotion for ultra-smooth scrolling.",
  "phone_ids": ["3"],
  "rationale": "Compared measured brightness values from tests data across all phones"
}}

Query: "Compare Samsung S25 FE vs iPhone Air"
Response:
{{
  "response_type": "comparison",
  "message": "**iPhone Air (₹96,999)** vs **Samsung S25 FE (₹65,999)**\\n\\n**Display:**\\n• iPhone: 6.7\\" Super Retina XDR, 1100 nits peak (measured)\\n• Samsung: 6.5\\" AMOLED 120Hz, 998 nits peak (measured)\\n*Winner: iPhone (brighter, better outdoors)*\\n\\n**Performance:**\\n• iPhone: Apple A18 (industry-leading)\\n• Samsung: Exynos 2400 (good, but 15-20% behind)\\n\\n**Battery:**\\n• iPhone: 18:30h endurance (tested)\\n• Samsung: 40:00h endurance (tested)\\n*Winner: Samsung (2x battery life!)*\\n\\n**Camera:** iPhone has superior processing, Samsung has more versatile lens setup\\n\\n**Verdict:** iPhone for performance & display. Samsung for battery & value (₹31k cheaper).",
  "phone_ids": ["3", "9"],
  "rationale": "Comparison using real test data for display brightness and battery endurance"
}}

Query: "Best display phone?"
Response:
{{
  "response_type": "recommendation",
  "message": "For the best display, I recommend the iPhone 17 Pro Max at ₹129,999. It features a stunning 6.9\\" LTPO Super Retina XDR display with 1200 nits peak brightness (measured), 120Hz ProMotion, and exceptional color accuracy. Perfect for media consumption and HDR content.",
  "phone_ids": ["3"],
  "rationale": "Filtered by display quality, prioritized measured brightness from tests data"
}}

USER QUERY: {user_query}

Respond with ONLY valid JSON following the format above."""

    try:
        # Call Gemini API
        url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}'
        
        response = http.request(
            'POST',
            url,
            headers={'Content-Type': 'application/json'},
            body=json.dumps({
                "contents": [{
                    "parts": [{
                        "text": system_prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 4096,  # Increased from 2048 for detailed comparisons
                    "responseMimeType": "application/json"
                }
            }).encode('utf-8')
        )
        
        if response.status != 200:
            print(f"Gemini API error: {response.status}")
            print(f"Response: {response.data.decode('utf-8')}")
            raise Exception(f"Gemini API returned status {response.status}")
        
        result = json.loads(response.data.decode('utf-8'))
        print("Gemini Response:", result)
        
        # Extract the generated text
        if 'candidates' not in result or len(result['candidates']) == 0:
            raise Exception("No candidates in Gemini response")
        
        candidate = result['candidates'][0]
        finish_reason = candidate.get('finishReason', 'UNKNOWN')
        
        # Check if response was truncated
        if finish_reason == 'MAX_TOKENS':
            print("WARNING: Response truncated due to MAX_TOKENS")
            # Try to salvage what we can
            assistant_message = candidate['content']['parts'][0]['text']
            
            # Attempt to close incomplete JSON
            if assistant_message.strip().endswith('"'):
                assistant_message += '\n}'
            elif not assistant_message.strip().endswith('}'):
                # Find last complete field and close JSON
                last_complete = assistant_message.rfind('",')
                if last_complete > 0:
                    assistant_message = assistant_message[:last_complete + 1] + '\n}'
                else:
                    # Can't salvage, return fallback
                    return {
                        "response_type": "conversational",
                        "message": "The comparison is quite detailed. Let me give you a concise summary: Both are excellent flagship phones. Check the detailed specs of each phone by clicking on them. Would you like me to compare specific features instead?",
                        "phone_ids": [],
                        "rationale": "Response too long, truncated"
                    }
        else:
            assistant_message = candidate['content']['parts'][0]['text']
        
        print("Assistant Message:", assistant_message)
        
        # Parse JSON response
        parsed = json.loads(assistant_message)
        
        # Validate structure
        if 'message' not in parsed:
            parsed['message'] = "Here are the results."
        if 'phone_ids' not in parsed:
            parsed['phone_ids'] = []
        if 'response_type' not in parsed:
            parsed['response_type'] = 'conversational'
        if 'rationale' not in parsed:
            parsed['rationale'] = 'AI analysis'
        
        # Ensure phone IDs are strings and valid
        parsed['phone_ids'] = [str(pid) for pid in parsed.get('phone_ids', [])]
        
        # Validate phone IDs exist in database
        valid_ids = set(str(p['id']) for p in phones_data)
        parsed['phone_ids'] = [pid for pid in parsed['phone_ids'] if pid in valid_ids]
        
        return parsed
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"Raw response: {assistant_message if 'assistant_message' in locals() else 'N/A'}")
        
        return {
            "response_type": "conversational",
            "message": "I'm having trouble formatting the response. Could you rephrase your question? For example: 'Best phone under 50k' or 'Explain OIS vs EIS'",
            "phone_ids": [],
            "rationale": "JSON parsing error"
        }
        
    except Exception as e:
        print(f"Gemini error: {e}")
        import traceback
        traceback.print_exc()
        
        return {
            "response_type": "conversational",
            "message": "I'm having trouble processing that. Could you try rephrasing? For example: 'Best gaming phone under 60k' or 'Compare iPhone vs Samsung'",
            "phone_ids": [],
            "rationale": "Error in AI processing"
        }

def handler(event, context):
    """Lambda handler"""
    
    # CORS
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        http_method = event.get('httpMethod', 'GET')
        path = event.get('path', '')
        
        # GET /phones
        if http_method == 'GET' or '/phones' in path:
            all_phones = get_all_phones()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(all_phones, cls=DecimalEncoder)
            }
        
        # POST /search
        elif http_method == 'POST' and '/search' in path:
            body = json.loads(event.get('body', '{}'))
            user_query = body.get('query', '').strip()
            conversation_history = body.get('history', [])
            
            if not user_query:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Query required'})
                }
            
            if len(user_query) > 500:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'explanation': 'Query too long (max 500 chars)',
                        'phones': [],
                        'response_type': 'rejection'
                    })
                }
            
            all_phones = get_all_phones()
            
            if not all_phones:
                return {
                    'statusCode': 500,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Failed to fetch phones'})
                }
            
            # Call Gemini
            result = call_gemini(user_query, all_phones, conversation_history)
            
            # Filter phones by IDs
            phone_ids = set(str(pid) for pid in result.get('phone_ids', []))
            filtered_phones = [
                p for p in all_phones 
                if str(p.get('id')) in phone_ids
            ] if phone_ids else []
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'explanation': result.get('message', 'Here are the results'),
                    'response_type': result.get('response_type', 'conversational'),
                    'rationale': result.get('rationale', ''),
                    'phones': filtered_phones,
                    'query': user_query
                }, cls=DecimalEncoder)
            }
        
        else:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not found'})
            }
        
    except Exception as e:
        print(f"Handler error: {e}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error'})
        }