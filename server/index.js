import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import OpenAI from 'openai'

// Load server environment variables
dotenv.config({ path: '.env.server' })

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL || 'https://your-domain.com'
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))

// Initialize OpenAI client with server-side API key
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
})

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, provider = 'openrouter' } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Messages array is required',
      })
    }

    let response
    if (provider === 'openrouter') {
      // Call OpenRouter API
      const openrouterMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))

      response = await openrouter.chat.completions.create({
        model: 'anthropic/claude-3.5-sonnet',
        messages: openrouterMessages,
        max_tokens: 2000,
        temperature: 0.7,
      })
    } else if (provider === 'openai') {
      // For future OpenAI integration
      return res.status(501).json({
        error: 'OpenAI provider not yet implemented',
      })
    } else {
      return res.status(400).json({
        error: 'Unsupported AI provider',
      })
    }

    const content = response.choices[0]?.message?.content
    if (!content) {
      return res.status(500).json({
        error: 'No content received from AI service',
      })
    }

    res.json({
      content,
      provider,
      usage: response.usage,
    })
  } catch (error) {
    console.error('AI API error:', error)

    // Don't expose API keys in error messages
    if (error.message.includes('API key')) {
      return res.status(500).json({
        error: 'AI service configuration error',
      })
    }

    res.status(500).json({
      error: 'Failed to get response from AI service',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    providers: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
    },
  })
})

// Mock response endpoint for development
app.post('/api/chat/mock', (req, res) => {
  const { messages } = req.body
  const lastMessage = messages?.[messages?.length - 1]

  let mockResponse = `I understand you're looking to create a user story. Here's a template you can use:

## User Story Template

**As a** [type of user]  
**I want to** [perform some action]  
**So that** [achieve some goal]  

### Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

Would you like me to help you fill in the details for your specific requirement?`

  if (lastMessage?.content?.toLowerCase().includes('user story')) {
    mockResponse = `## User Story: Login Feature

**As a** registered user  
**I want to** log into the application  
**So that** I can access my personal dashboard  

### Acceptance Criteria:
- [ ] User can enter email and password
- [ ] System validates credentials
- [ ] User is redirected to dashboard on success
- [ ] Error message shown for invalid credentials
- [ ] "Remember me" option available
- [ ] Password reset link provided

### Assumptions:
- Users have already registered
- Email verification is handled separately`
  }

  if (lastMessage?.content?.toLowerCase().includes('acceptance criteria')) {
    mockResponse = `## Acceptance Criteria for User Authentication

### Functional Requirements:
- [ ] Email/password validation on login form
- [ ] JWT token generation and storage
- [ ] Session management with automatic logout
- [ ] Password strength requirements (8+ chars, mixed case, numbers)

### Non-Functional Requirements:
- [ ] Login response time < 2 seconds
- [ ] Support for 1000 concurrent users
- [ ] Mobile-responsive login form
- [ ] Accessibility compliance (WCAG 2.1 AA)

### Edge Cases:
- [ ] Account locked after 5 failed attempts
- [ ] Handle network timeouts gracefully
- [ ] Prevent brute force attacks
- [ ] Handle expired sessions`
  }

  res.json({
    content: mockResponse,
    provider: 'mock',
    usage: { total_tokens: 150 },
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🤖 AI API server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})

export default app
