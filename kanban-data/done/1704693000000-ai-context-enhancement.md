# AI Context Enhancement for Co-Create Page

## Description

Improve the AI co-creator experience by automatically providing card context to the AI when starting a chat session on the co-create page.

## User Story

As a product owner using the co-create page, I want the AI to automatically understand the context of the card I'm working on, so that I can have more relevant and contextual conversations about refining my user stories.

## Acceptance Criteria

### Context Provisioning

- [ ] AI automatically receives card context when opening an existing card in co-create mode
- [ ] Card title is included in the AI context
- [ ] Card content preview (first 500 characters) is provided to avoid token limits
- [ ] Card metadata (tags, assignee, due date) is included when available
- [ ] Context is formatted in a clear, structured manner for AI understanding

### Enhanced System Message

- [ ] AI system message includes comprehensive card context
- [ ] Context is properly formatted with markdown styling for clarity
- [ ] AI acknowledges the specific card being worked on
- [ ] System message provides relevant suggestions based on card content

### User Experience

- [ ] AI immediately understands what card the user is working on
- [ ] No manual explanation needed about the card context
- [ ] AI can provide more targeted and relevant suggestions
- [ ] Conversation starts with clear understanding of the current task

### Technical Implementation

- [ ] Context building happens automatically when URL params are detected
- [ ] Content is truncated appropriately to prevent token overflow
- [ ] Metadata is only included when available (tags, assignee, due date)
- [ ] System message replaces generic greeting with contextual information

## Implementation Details

- Modified `CoCreator.tsx` to build comprehensive card context
- Enhanced system message includes structured card information
- Content preview limited to 500 characters to respect API limits
- Metadata handling with proper fallbacks for missing fields

## Definition of Done

- All acceptance criteria met and tested
- System provides rich context to AI automatically
- User experience improved with contextual AI responses
- No breaking changes to existing functionality
- All tests pass and build completes successfully
