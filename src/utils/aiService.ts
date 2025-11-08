import OpenAI from 'openai'
import { AIMessage, AIProvider } from '../types/ai'

export class AIService {
  private openai: OpenAI | null = null
  private openrouter: OpenAI | null = null

  constructor() {
    // Initialize OpenAI client if key provided
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true, // Note: In production, this should be handled server-side
      })
    }

    // Initialize OpenRouter client if key provided
    if (import.meta.env.VITE_OPENROUTER_API_KEY) {
      this.openrouter = new OpenAI({
        apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        dangerouslyAllowBrowser: true,
      })
    }
  }

  async sendMessage(
    messages: AIMessage[],
    provider: AIProvider
  ): Promise<string> {
    if (provider.name === 'mock' || (!this.openai && !this.openrouter)) {
      return this.getMockResponse(messages)
    }

    if (provider.name === 'openai' && this.openai) {
      return this.sendOpenAIMessage(messages)
    }

    if (provider.name === 'openrouter' && this.openrouter) {
      return this.sendOpenRouterMessage(messages)
    }

    throw new Error(`Unsupported AI provider: ${provider.name}`)
  }

  private async sendOpenRouterMessage(messages: AIMessage[]): Promise<string> {
    if (!this.openrouter) {
      throw new Error('OpenRouter client not initialized')
    }

    try {
      const openrouterMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }))

      const response = await this.openrouter.chat.completions.create({
        model: 'anthropic/claude-3.5-sonnet', // Using a high-quality model through OpenRouter
        messages: openrouterMessages,
        max_tokens: 2000,
        temperature: 0.7,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content received from OpenRouter')
      }

      return content
    } catch (error) {
      console.error('OpenRouter API error:', error)
      throw new Error('Failed to get response from OpenRouter service')
    }
  }

  private async sendOpenAIMessage(messages: AIMessage[]): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized')
    }

    try {
      const openaiMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }))

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using a cost-effective model
        messages: openaiMessages,
        max_tokens: 2000,
        temperature: 0.7,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      return content
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to get response from AI service')
    }
  }

  private getMockResponse(messages: AIMessage[]): string {
    const lastMessage = messages[messages.length - 1]

    // Simple mock responses based on content
    if (lastMessage.content.toLowerCase().includes('user story')) {
      return `## User Story: Login Feature

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

    if (lastMessage.content.toLowerCase().includes('acceptance criteria')) {
      return `## Acceptance Criteria for User Authentication

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

    // Default mock response
    return `I understand you're looking to create a user story. Here's a template you can use:

## User Story Template

**As a** [type of user]  
**I want to** [perform some action]  
**So that** [achieve some goal]  

### Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

Would you like me to help you fill in the details for your specific requirement?`
  }
}

// Singleton instance
export const aiService = new AIService()
