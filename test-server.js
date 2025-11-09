import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Test server setup
const testApp = express()
const PORT = 3001

testApp.use(cors())
testApp.use(express.json())

testApp.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is running without exposed API keys'
  })
})

testApp.post('/api/chat', (req, res) => {
  res.json({ 
    content: 'Mock response - API keys are now server-side only',
    provider: 'test'
  })
})

testApp.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})
