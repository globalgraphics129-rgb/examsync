import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType, Tool } from '@google/generative-ai';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, context } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'AI service not configured.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemInstruction = `You are ExamSync AI, a highly intelligent voice-enabled assistant built into the ExamSync platform.
    
Context about the user talking to you right now:
Name: ${context.name}
University: ${context.university}
Faculty: ${context.faculty}
Department: ${context.department}
Semester: ${context.semester}
Courses currently taking: ${context.courses?.join(', ') || 'None selected'}
Current CGPA/Grades data: ${JSON.stringify(context.grades || {})}
Google Calendar Linked: ${context.googleLinked ? 'Yes' : 'No'}

Respond concisely and conversationally, as your response will be read aloud via Text-to-Speech.
If the user asks about their courses, grades, or schedule, use the context above to give an exact, personalized answer.
If the user asks to schedule something, and their Google Calendar is linked, use the scheduleCalendarEvent tool.
Always assume the timezone is the user's local timezone. Today is ${new Date().toLocaleString()}.`;

    const tools: Tool[] = [];
    if (context.googleLinked && context.googleAccessToken) {
      const scheduleCalendarEvent: FunctionDeclaration = {
        name: "scheduleCalendarEvent",
        description: "Schedules an event on the user's Google Calendar. Only use this if the user explicitly asks to schedule or set a reminder.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            summary: { type: SchemaType.STRING, description: "Title of the event (e.g. 'Study for CSC 401')" },
            startTime: { type: SchemaType.STRING, description: "ISO 8601 string for start time" },
            endTime: { type: SchemaType.STRING, description: "ISO 8601 string for end time" },
            description: { type: SchemaType.STRING, description: "Event description" }
          },
          required: ["summary", "startTime", "endTime"]
        }
      };
      tools.push({ functionDeclarations: [scheduleCalendarEvent] });
    }

    // Convert frontend messages to Gemini format
    // Frontend format: { role: 'user'|'assistant', content: string }
    const geminiHistory = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    
    // We separate the last user message from history for the generateContent call
    const currentMessage = geminiHistory.pop();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: { role: "user", parts: [{ text: systemInstruction }] },
      tools: tools.length > 0 ? tools : undefined
    });

    const chat = model.startChat({
      history: geminiHistory,
    });

    let result = await chat.sendMessage(currentMessage.parts);

    const functionCalls = result.response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'scheduleCalendarEvent') {
        const { summary, startTime, endTime, description } = call.args as any;
        
        let toolResult = '';
        try {
          const gcalResponse = await axios.post(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            {
              summary,
              description,
              start: { dateTime: startTime },
              end: { dateTime: endTime }
            },
            {
              headers: {
                Authorization: `Bearer ${context.googleAccessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          toolResult = `Successfully scheduled event: ${gcalResponse.data.htmlLink}`;
        } catch (error: any) {
          console.error("Google Calendar API Error:", error.response?.data || error.message);
          toolResult = `Failed to schedule event. Tell the user there was an error with Google Calendar permissions or token expiration.`;
        }

        // Send function response back to Gemini
        result = await chat.sendMessage([{
          functionResponse: {
            name: 'scheduleCalendarEvent',
            response: { content: toolResult }
          }
        }]);
      }
    }

    const reply = result.response.text();
    
    res.status(200).json({ reply: reply || "I'm sorry, I couldn't process that." });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
