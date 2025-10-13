export interface CardMetadata {
  created: Date
  updated: Date
  tags?: string[]
  assignee?: string
  dueDate?: Date
}

export interface Card {
  id: string
  title: string
  content: string
  column: string
  filePath: string
  metadata: CardMetadata
}

export interface Column {
  id: string
  title: string
  cards: Card[]
}
