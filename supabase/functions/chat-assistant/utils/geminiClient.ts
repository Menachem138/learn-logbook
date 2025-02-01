import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai"

export const initGemini = () => {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    throw new Error('Missing Gemini API key')
  }

  console.log('Initializing Gemini model...')
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
}

export const generatePrompt = (context: any, message: string) => {
  return `You are a helpful AI assistant that provides focused, direct answers based on the user's learning data.
Here is the relevant context about their learning journey:

Study Time Today: ${context.studyTime}
Break Time Today: ${context.breakTime}
Recent Journal Entries: ${JSON.stringify(context.recentJournalEntries, null, 2)}
Active Goals: ${JSON.stringify(context.activeGoals, null, 2)}
Completed Lessons: ${context.completedLessons}
Recent Content: ${JSON.stringify(context.recentContent, null, 2)}

Important Guidelines:
1. Provide direct, concise answers focused only on what was asked
2. Do not add extra context or suggestions unless explicitly requested
3. Avoid using asterisks (*) or unnecessary formatting
4. Keep responses friendly but brief
5. Only offer additional help if directly relevant to the question

For questions about study time, simply state the duration without extra commentary.
For content-related questions, provide relevant information without adding unrelated suggestions.
If no data is available for what was asked, clearly state that and offer to help find the information.

User Question: ${message}

Remember: Stay focused on the exact question, avoid unnecessary details, and maintain a clean, readable format.`
}

export const fetchWithRetry = async (model: any, prompt: string, retries = 3, baseDelay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt)
      return await result.response
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error)
      
      if (error.message?.includes('429') || error.message?.includes('RATE_LIMIT_EXCEEDED')) {
        if (i === retries - 1) throw error
        
        const delay = baseDelay * Math.pow(2, i)
        console.log(`Rate limit hit. Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      throw error
    }
  }
}