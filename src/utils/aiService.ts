import { AIMessage, AIProvider } from '../types/ai'

export class AIService {
  private baseUrl: string

  constructor() {
    // Use environment variable for API base URL
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
  }

  async sendMessage(
    messages: AIMessage[],
    provider: AIProvider
  ): Promise<string> {
    if (provider.name === 'mock') {
      return this.getMockResponse(messages)
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          provider: provider.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.content
    } catch (error) {
      console.error('AI API error:', error)

      // Fall back to mock response if server is unavailable
      console.warn('Falling back to mock response due to server error')
      return this.getMockResponse(messages)
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
