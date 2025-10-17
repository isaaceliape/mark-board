export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export interface AIProvider {
  name: string
  apiKey?: string
  baseURL?: string
}

export interface ChatSession {
  id: string
  messages: AIMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  category: 'user-story' | 'acceptance-criteria' | 'refinement'
}

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'user-story-basic',
    name: 'Basic User Story',
    description: 'Generate a basic user story with title and description',
    template: `Create a user story for the following requirement:

{user_input}

Please provide:
1. A clear, concise title
2. A detailed description following the "As a [user], I want [goal] so that [benefit]" format
3. Key acceptance criteria
4. Any assumptions or dependencies`,
    category: 'user-story',
  },
  {
    id: 'acceptance-criteria',
    name: 'Acceptance Criteria',
    description: 'Generate detailed acceptance criteria for a user story',
    template: `Given this user story:

{user_input}

Generate comprehensive acceptance criteria that include:
1. Functional requirements
2. Non-functional requirements
3. Edge cases and error conditions
4. Performance expectations
5. Security considerations

Format the criteria as a clear, testable checklist.`,
    category: 'acceptance-criteria',
  },
  {
    id: 'user-story-refinement',
    name: 'Refine User Story',
    description: 'Refine and improve an existing user story',
    template: `Please refine and improve this user story:

{user_input}

Suggestions for improvement:
1. Make the title more specific and actionable
2. Ensure the description follows proper user story format
3. Add missing context or constraints
4. Break down complex stories into smaller ones
5. Add relevant acceptance criteria
6. Consider edge cases and error scenarios`,
    category: 'refinement',
  },
]
