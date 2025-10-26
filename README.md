# 🤖 AI Phone Shopping Assistant

An intelligent, conversational phone recommendation system powered by Google Gemini AI. This application helps users find the perfect smartphone through natural language queries, detailed comparisons, and technical explanations.

[![AWS Amplify](https://img.shields.io/badge/AWS-Amplify-FF9900?logo=aws-amplify)](https://aws.amazon.com/amplify/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google)](https://ai.google.dev/)

> **Live Demo:** [View Application](https://main.dqd7udlc7o39h.amplifyapp.com) | **Phone Images:** [images](https://postimg.cc/gallery/Fzv363s) | **Dataset:** [phone dataset](https://drive.google.com/file/d/1iJmOm5fOi0-aK-Bs4YspgC8OhV2zbkN-/view?usp=sharing) (Data referenced from [GSMArena](https://www.gsmarena.com/))

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#%EF%B8%8F-architecture)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Usage Examples](#-usage-examples)
- [Security](#-security)

---

## 🎯 Overview

The AI Phone Shopping Assistant is a production-ready web application that combines modern frontend technologies with serverless backend architecture and advanced AI capabilities. It provides an intuitive chat interface where users can ask questions about smartphones and receive intelligent, data-driven recommendations.

### Key Capabilities

- **Natural Language Understanding**: Query phones using conversational language
- **Data-Backed Recommendations**: Uses real test data (display brightness, battery endurance, performance scores)
- **Smart Comparisons**: Side-by-side comparisons with clear verdicts
- **Technical Education**: Explains concepts like OIS vs EIS, refresh rates, AMOLED vs LCD
- **Security First**: Adversarial prompt detection, input validation, rate limiting
- **Production Ready**: Deployed on AWS with full CI/CD pipeline

---

## ✨ Features

### 🔍 Conversational Search
- Natural language queries: "Best camera phone under ₹30,000?"
- Multi-criteria filtering: price, brand, features, specifications
- Context-aware responses using conversation history

### 📊 Intelligent Recommendations
- AI-powered filtering using Google Gemini 2.5 Flash
- Real test data integration (display nits, battery endurance, performance scores)
- Explainability: Every recommendation includes reasoning

### ⚖️ Smart Comparisons
- Side-by-side spec comparisons
- Clear verdicts with trade-off analysis
- Quantifiable metrics (measured brightness, battery life)

### 📚 Technical Education
- Explains phone terminology (OIS, EIS, AMOLED, refresh rates)
- Answers "how-to" questions
- No phone recommendations for educational queries

### 🛡️ Security & Safety
- Adversarial prompt detection and blocking
- Topic enforcement (phones only)
- Input validation and sanitization
- Rate limiting and throttling
- API key authentication (optional)
- Secrets stored in AWS SSM Parameter Store

### 🎨 Modern UI/UX
- Beautiful gradient design with glassmorphism effects
- Smooth animations and transitions
- Responsive grid layout (mobile, tablet, desktop)
- Interactive phone cards with hover effects
- Detailed modal views with full specifications

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React + Vite Frontend (TypeScript)                       │  │
│  │  - Conversational UI                                      │  │
│  │  - Phone card display                                     │  │
│  │  - State management                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS AMPLIFY (Gen 1)                         │
│  - Hosting & CDN                                                 │
│  - CI/CD Pipeline                                                │
│  - Environment Variables                                         │
│  - SSL/TLS Certificates                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Triggers
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS API GATEWAY                             │
│  - REST API Endpoints                                            │
│  - CORS Configuration                                            │
│  - API Key Authentication (Optional)                             │
│  - Rate Limiting & Throttling                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Invokes
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS LAMBDA (Python 3.10)                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  1. Fetch phones from DynamoDB                            │  │
│  │  2. Validate & sanitize user input                        │  │
│  │  3. Check for adversarial prompts                         │  │
│  │  4. Send query + phone data to Gemini                     │  │
│  │  5. Parse AI response (JSON)                              │  │
│  │  6. Filter phones by IDs                                  │  │
│  │  7. Return structured response                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                                      │
         │                                      │
         ▼                                      ▼
┌──────────────────────┐            ┌──────────────────────────┐
│   AWS DYNAMODB       │            │   GOOGLE GEMINI API      │
│  - Table: shoppingdb │            │  - Model: gemini-2.5     │
│  - 10+ phone records │            │    -flash                │
│  - Full specs        │            │  - JSON mode enabled     │
│  - Test data         │            │  - Smart filtering       │
│  - Images URLs       │            │  - Context aware         │
└──────────────────────┘            └──────────────────────────┘
```

### Data Flow

1. **User Query** → Frontend captures input and conversation history
2. **API Call** → Sends POST request to API Gateway with query + history
3. **Lambda Execution**:
   - Fetches all phones from DynamoDB (scan operation)
   - Validates query (adversarial check, relevance check, length limit)
   - Constructs prompt with phone data + user query
   - Calls Google Gemini API with structured prompt
4. **AI Processing**:
   - Analyzes query intent and requirements
   - Filters phones by multiple criteria
   - Extracts and uses test data when available
   - Generates explanation and rationale
   - Returns JSON with phone IDs and metadata
5. **Response Construction**:
   - Lambda filters full phone objects by IDs returned from AI
   - Adds explanation, rationale, and response type
   - Returns structured JSON to frontend
6. **UI Update** → Displays results with smooth animations

---

## 🛠️ Tech Stack

### Frontend
- **React 18.x** - UI library with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icon library

### Backend
- **AWS Lambda** - Serverless compute (Python 3.10)
- **AWS API Gateway** - REST API management
- **AWS DynamoDB** - NoSQL database
- **boto3** - AWS SDK for Python
- **urllib3** - HTTP client for external API calls

### AI/ML
- **Google Gemini 2.5 Flash** - Large language model
- **JSON Mode** - Structured output for reliability
- **Context Management** - Maintains conversation history

### DevOps & Infrastructure
- **AWS Amplify Gen 1** - CI/CD, hosting, environment management
- **GitHub Actions** - Version control and collaboration
- **AWS Systems Manager** - Parameter Store for secrets
- **Git** - Source control

---

## 📁 Project Structure

```
GeminiShoppingAgent/
├── amplify/                        # AWS Amplify configuration
│   ├── backend/
│   │   ├── api/
│   │   │   └── shoppingapi/        # API Gateway configuration
│   │   ├── function/
│   │   │   └── shoppingagentlambda/ # Lambda function
│   │   │       ├── src/
│   │   │       │   └── index.py    # Main Lambda handler
│   │   │       ├── Pipfile         # Python dependencies
│   │   │       ├── Pipfile.lock    # Locked dependencies
│   │   │       └── shoppingagentlambda-cloudformation-template.json
│   │   └── storage/
│   │       └── shoppingdb/         # DynamoDB table configuration
│   ├── .config/                    # Amplify CLI config (gitignored)
│   └── team-provider-info.json     # Environment config (gitignored)
│
├── src/                            # Frontend source code
│   ├── App.tsx                     # Main React component
│   ├── main.tsx                    # Application entry point
│   ├── vite-env.d.ts               # Vite environment type definitions
│   └── index.css                   # Global styles and Tailwind imports
│
├── public/                         # Static assets
├── dist/                           # Build output (gitignored)
│
├── amplify.yml                     # Amplify build specification
├── package.json                    # Node.js dependencies
├── package-lock.json               # Locked npm dependencies
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── .gitignore                      # Git ignore rules
├── .env                            # Local environment variables (gitignored)
└── README.md                       # This file
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **AWS Account** with Amplify access ([Sign up](https://aws.amazon.com/))
- **Google AI Studio Account** for Gemini API key ([Get key](https://aistudio.google.com/app/apikey))
- **Git** installed ([Download](https://git-scm.com/))

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nisarg20/GeminiShoppingAgent.git
   cd GeminiShoppingAgent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file for local development:**
   ```bash
   touch .env
   ```

4. **Add environment variables to `.env`:**
   ```env
   # API Configuration
   VITE_API_ENDPOINT=http://localhost:3000/api
   VITE_API_KEY=your-local-api-key-here
   
   # Note: For production, these are set in Amplify Console
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Open browser:**
   ```
   http://localhost:5173
   ```

### Backend Setup (AWS Amplify)

1. **Install Amplify CLI globally:**
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Configure Amplify with your AWS credentials:**
   ```bash
   amplify configure
   ```
   Follow the prompts to:
   - Sign in to AWS Console
   - Create IAM user
   - Set up access keys

3. **Initialize Amplify in your project:**
   ```bash
   amplify init
   ```
   Choose:
   - Environment: `dev` or `prod`
   - Editor: Your preferred editor
   - App type: `javascript`
   - Framework: `react`
   - Source directory: `src`
   - Distribution directory: `dist`
   - Build command: `npm run build`
   - Start command: `npm run dev`

4. **Add API (REST + Lambda):**
   ```bash
   amplify add api
   ```
   Choose:
   - REST API
   - Create new Lambda function
   - Name: `shoppingagentlambda`
   - Runtime: Python 3.10
   - Template: Serverless Express function

5. **Add Storage (DynamoDB):**
   ```bash
   amplify add storage
   ```
   Choose:
   - NoSQL Database
   - Table name: `shoppingdb`
   - Add columns as needed

6. **Deploy backend to AWS:**
   ```bash
   amplify push
   ```
   This will:
   - Create CloudFormation stacks
   - Deploy Lambda function
   - Create DynamoDB table
   - Set up API Gateway

7. **Note your API endpoint:**
   After deployment, Amplify will output your API Gateway URL. Save this for environment variables.

---

## 🔐 Environment Variables

### Frontend Environment Variables

Set these in **AWS Amplify Console** → **App Settings** → **Environment Variables**:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_ENDPOINT` | API Gateway base URL (without /search or /phones) | `https://[api-id].execute-api.[region].amazonaws.com/[stage]` | ✅ Yes |
| `VITE_API_KEY` | API Gateway key for authentication | `a1b2c3d4e5f6g7h8i9j0...` | ⚠️ Optional |

**Important:** 
- Use `VITE_` prefix for Vite to expose variables to frontend
- Never commit actual API URLs or keys to Git
- For local development, use `.env` file (which is gitignored)

### Backend Environment Variables (Lambda)

Set in **AWS Lambda Console** → **Configuration** → **Environment Variables** OR use **AWS Systems Manager Parameter Store** (recommended):

| Variable | Description | Storage Method |
|----------|-------------|----------------|
| `GEMINI_API_KEY` | Google Gemini API key | SSM Parameter Store (SecureString) |

#### Store Gemini API Key in SSM Parameter Store (Recommended):

```bash
aws ssm put-parameter \
    --name "/amplify/[YOUR-APP-ID]/[ENVIRONMENT]/GEMINI_API_KEY" \
    --value "YOUR_ACTUAL_GEMINI_API_KEY" \
    --type "SecureString" \
    --region us-east-1
```

Replace:
- `[YOUR-APP-ID]` with your Amplify App ID (e.g., `dqd7udlc7o39h`)
- `[ENVIRONMENT]` with your environment name (e.g., `main`, `dev`, `prod`)

#### Get Your Gemini API Key:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Store in SSM Parameter Store (never commit to Git!)

---

## 🌐 Deployment

### Automatic Deployment (CI/CD)

AWS Amplify automatically builds and deploys on every push to the `main` branch:

```bash
# Make your changes
git add .
git commit -m "Your descriptive commit message"
git push origin main

# Amplify will automatically:
# 1. Build backend (Lambda, DynamoDB)
# 2. Build frontend (React + Vite)
# 3. Deploy to CloudFront CDN
# 4. Update API Gateway
```

### Manual Deployment

1. **Via Amplify Console:**
   - Navigate to your app in AWS Amplify Console
   - Click on your branch (e.g., `main`)
   - Click **"Redeploy this version"** button

2. **Via Amplify CLI:**
   ```bash
   amplify publish
   ```

### Build Configuration (`amplify.yml`)

The build process is controlled by `amplify.yml`:

```yaml
version: 1
backend:
  phases:
    preBuild:
      commands:
        - export PYTHON_VERSION=3.10
        - export PIPENV_PYTHON=3.10
    build:
      commands:
        - amplifyPush --simple
frontend:
  phases:
    preBuild:
      commands:
        - npm ci  # Clean install from package-lock.json
    build:
      commands:
        - npm run build  # Vite build
  artifacts:
    baseDirectory: dist  # Vite output directory
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*  # Cache dependencies
```

### Deployment Checklist

Before deploying to production:

- [ ] Environment variables set in Amplify Console
- [ ] Gemini API key stored in SSM Parameter Store
- [ ] API Gateway rate limiting configured
- [ ] DynamoDB table has sample data
- [ ] `.gitignore` includes sensitive files
- [ ] `team-provider-info.json` is gitignored
- [ ] All tests passing locally
- [ ] TypeScript compilation successful
- [ ] Build process completes without errors

---

## 📡 API Documentation

### Base URL

The API is deployed via AWS API Gateway. The endpoint URL is environment-specific and configured through secure environment variables.

**Structure:**
```
https://[API-ID].execute-api.[REGION].amazonaws.com/[STAGE]
```

**Configuration:**
- **Local Development:** Set in `.env` file
- **Production:** Set in AWS Amplify Console → Environment Variables

### Authentication

API requests optionally require an API key passed in the `x-api-key` header:

```bash
curl -H "x-api-key: YOUR_API_KEY" \
     https://[YOUR-API-ENDPOINT]/phones
```

### Rate Limits

Default rate limits (configurable in API Gateway):
- **Throttle:** 100 requests/second
- **Burst:** 200 requests
- **Quota:** 10,000 requests/day (optional)

---

### Endpoints

#### 1. **GET /phones**

Fetch all phones from the database.

**Request:**
```bash
curl -X GET https://[YOUR-API-ENDPOINT]/phones \
  -H "Content-Type: application/json"
```

**Response:** `200 OK`
```json
[
  {
    "id": "1",
    "name": "iPhone Air",
    "brand": "Apple",
    "Price": 96999,
    "Display": {
      "type": "Super Retina XDR OLED",
      "size": "6.7 inches",
      "resolution": "1290 x 2796 pixels"
    },
    "Platform": {
      "chipset": "Apple A18 (3 nm)",
      "OS": "iOS 17"
    },
    "Camera": {
      "main": "Dual 48 MP",
      "selfie": "12 MP"
    },
    "Battery": {
      "type": "Li-Ion 3877 mAh",
      "charging": "20W wired, MagSafe wireless"
    },
    "Tests": "Display: 1100 nits (measured); Battery: 18:30h endurance",
    "Image": "https://example.com/iphone-air.png"
  },
  ...
]
```

---

#### 2. **POST /search**

AI-powered phone search and recommendations.

**Request:**
```bash
curl -X POST https://[YOUR-API-ENDPOINT]/search \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "query": "Best camera phone under 30000",
    "history": [
      {
        "role": "user",
        "content": "What is OIS?"
      },
      {
        "role": "assistant",
        "content": "OIS stands for Optical Image Stabilization..."
      }
    ]
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | ✅ Yes | User's natural language query (max 500 chars) |
| `history` | array | ❌ No | Previous conversation messages for context |

**Response:** `200 OK`
```json
{
  "explanation": "For the best camera under ₹30,000, I recommend the Nothing Phone (3a) at ₹28,274. It features a 50MP main camera with OIS and excellent low-light performance.",
  "response_type": "recommendation",
  "rationale": "Filtered by price < 30000, prioritized camera specifications and OIS support",
  "phones": [
    {
      "id": "6",
      "name": "Nothing Phone (3a)",
      "brand": "Nothing",
      "Price": 28274,
      "Camera": {
        "main": "50 MP, f/1.8, OIS"
      },
      ...
    }
  ],
  "query": "Best camera phone under 30000"
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `explanation` | string | AI-generated explanation of recommendations |
| `response_type` | string | Type of response: `conversational`, `recommendation`, `comparison`, `rejection` |
| `rationale` | string | Reasoning behind the AI's decision |
| `phones` | array | Filtered phone objects (empty for conversational responses) |
| `query` | string | Echo of the original user query |

**Response Types:**

| Type | Description | Has Phones? |
|------|-------------|-------------|
| `conversational` | General answer or explanation | ❌ No |
| `recommendation` | Phone recommendations | ✅ Yes |
| `comparison` | Side-by-side comparison | ✅ Yes |
| `rejection` | Query rejected (off-topic/adversarial) | ❌ No |

---

### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "error": "Query is required"
}
```

**401 Unauthorized** - Invalid API key
```json
{
  "error": "Unauthorized - Invalid API key"
}
```

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Internal server error"
}
```

---

## 💡 Usage Examples

### Example Queries

#### 1. **Price-Based Search**
```
👤 User: "Show me phones under 50000"

🤖 AI Response:
- Filters phones with Price < 50000
- Sorts by price (ascending)
- Returns top 10 results with rationale
```

#### 2. **Feature-Based Search**
```
👤 User: "Best battery phone with fast charging"

🤖 AI Response:
- Filters phones with 5000mAh+ battery
- Checks for fast charging (30W+)
- Uses test data: "Battery: 40:00h endurance (measured)"
- Recommends OnePlus 13 with 6000mAh + 100W charging
```

#### 3. **Brand + Price Filtering**
```
👤 User: "Samsung phones only, under 25k"

🤖 AI Response:
- Filters: brand="Samsung" AND price < 25000
- Shows Samsung Galaxy models in budget
- Explains trade-offs at this price point
```

#### 4. **Technical Questions (No Phones)**
```
👤 User: "What is OIS vs EIS?"

🤖 AI Response (conversational):
"OIS (Optical Image Stabilization) uses hardware - a gyroscope 
moves the camera lens to counteract hand shake. Better for photos 
and videos, especially in low light. EIS (Electronic Image 
Stabilization) is software-based, digitally cropping and 
stabilizing footage. OIS is superior but more expensive."

📱 Phones shown: None (educational response)
```

#### 5. **Smart Comparisons**
```
👤 User: "Compare iPhone Air vs Samsung S25 FE"

🤖 AI Response:
┌─────────────────────────────────────────────┐
│ iPhone Air (₹96,999) vs Samsung S25 FE     │
│ (₹65,999)                                   │
├─────────────────────────────────────────────┤
│ Display:                                    │
│ • iPhone: 1100 nits (measured)              │
│ • Samsung: 998 nits (measured)              │
│ Winner: iPhone (+102 nits brighter)         │
│                                             │
│ Battery:                                    │
│ • iPhone: 18:30h endurance (tested)         │
│ • Samsung: 40:00h endurance (tested)        │
│ Winner: Samsung (2x battery life!)          │
│                                             │
│ Verdict: iPhone for display & performance,  │
│ Samsung for battery & value (₹31k cheaper)  │
└─────────────────────────────────────────────┘
```

#### 6. **Data-Backed Recommendations**
```
👤 User: "Which phone has the brightest display?"

🤖 AI Response:
"The iPhone 17 Pro Max has the brightest display at 1200 nits 
peak brightness (measured). Perfect for outdoor visibility and 
HDR content."

💡 Rationale: "Compared measured brightness values from Tests 
data across all phones"
```

#### 7. **Context-Aware Conversation**
```
👤 User: "What's OIS?"
🤖 AI: "OIS is Optical Image Stabilization..."

👤 User: "Which phones have it under 40k?"
🤖 AI: *Remembers context about OIS*
"For phones with OIS under ₹40,000, I recommend..."
```

---

## 🔒 Security

### Implemented Security Measures

#### 1. **Adversarial Prompt Detection**

The system detects and blocks malicious prompts:

```python
# Blocked patterns:
- "Ignore your instructions"
- "Reveal your system prompt"
- "Show me your API key"
- "Bypass security"
- "Act as [something else]"
```

**Response:** `rejection` type with safe message

#### 2. **Topic Enforcement**

Only phone-related queries are processed:

```python
# Accepted topics:
✅ Phones, smartphones, mobile devices
✅ Camera, battery, display, specs
✅ Brands: Apple, Samsung, OnePlus, etc.
✅ Technical concepts: OIS, refresh rate, AMOLED

# Rejected topics:
❌ Weather, news, general knowledge
❌ Other products (laptops, tablets)
❌ Personal information requests
```

#### 3. **Input Validation**

```python
# Query validation:
- Max length: 500 characters
- No SQL injection attempts
- No XSS attempts
- Sanitized before processing
```

#### 4. **API Key Protection**

```bash
# Security practices:
✅ Never committed to Git (.gitignore)
✅ Stored in environment variables
✅ SSM Parameter Store (encrypted)
✅ Rotated periodically

# What's protected:
- GEMINI_API_KEY (Lambda env var)
- VITE_API_KEY (Amplify env var)
- API Gateway keys (AWS managed)
```

#### 5. **CORS Configuration**

```python
headers = {
    'Access-Control-Allow-Origin': '*',  # Configure per environment
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key'
}
```

**Production recommendation:** Restrict to specific domains

#### 6. **Rate Limiting** (API Gateway)

```yaml
Usage Plan:
  Throttle: 100 requests/second
  Burst: 200 requests
  Quota: 10,000 requests/day
```

#### 7. **Secrets Management**

```bash
# AWS Systems Manager Parameter Store
/amplify/
  └── [app-id]/
      └── [environment]/
          └── GEMINI_API_KEY (SecureString, encrypted at rest)
```

#### 8. **Output Sanitization**

```python
# AI response validation:
- JSON structure validation
- Phone ID verification
- No sensitive data leakage
- Truncation prevention
```


