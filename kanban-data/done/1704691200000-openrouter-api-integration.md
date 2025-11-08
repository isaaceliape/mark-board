# OpenRouter API Integration for Co-Creator Chat

## Description

Integrate the OpenRouter API with the co-create page chat interface to enable AI-powered user story generation and enhancement.

## User Story

As a product owner, I want to use AI assistance directly in the co-creator page to generate, refine, and improve user stories through natural language chat, so that I can create high-quality user stories more efficiently.

## Acceptance Criteria

### Core Functionality

- [ ] Environment variable `OPENROUTER_API_KEY` is loaded from .env file in project root
- [ ] Chat interface on co-create page connects to OpenRouter API using the provided key
- [ ] AI can respond to user messages about user story creation, refinement, and improvement
- [ ] Chat maintains conversation context throughout the co-creator session
- [ ] AI responses are displayed in a formatted, readable manner in the chat interface

### Error Handling

- [ ] Graceful handling when API key is missing or invalid
- [ ] User-friendly error messages when API calls fail
- [ ] Fallback behavior when OpenRouter service is unavailable
- [ ] Loading states during API requests

### User Experience

- [ ] Seamless integration with existing chat interface design
- [ ] Typing indicators during AI response generation
- [ ] Ability to clear conversation history
- [ ] Option to save chat transcripts for future reference

### Technical Requirements

- [ ] API calls use appropriate OpenRouter endpoints for chat completion
- [ ] Secure API key handling (no exposure in client-side code)
- [ ] Rate limiting and request throttling to respect OpenRouter limits
- [ ] Proper error logging for debugging

### Integration Points

- [ ] AI responses can be inserted into the markdown editor
- [ ] AI responses can replace current editor content
- [ ] Existing conversation persistence via localStorage continues to work
- [ ] No impact on current manual editing capabilities

## Implementation Notes

- Should use appropriate OpenRouter model for conversational AI
- Maintain compatibility with existing AI service abstraction layer
- Consider using streaming responses for better UX
- Implement proper retry logic for failed requests

## Definition of Done

- All acceptance criteria met and tested
- Code follows project conventions and patterns
- Unit and integration tests pass
- Documentation updated if needed
- Feature tested end-to-end by opening a card in co-create mode
