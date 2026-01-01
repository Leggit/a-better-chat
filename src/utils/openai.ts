import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[]
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages,
    });

    return (
      response.choices[0].message.content ||
      "I apologize, but I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function generateClarificationResponse(
  selectedText: string,
  userQuestion: string,
  conversationContext?: string[]
) {
  try {
    const context = conversationContext
      ? `\n\nConversation context:\n${conversationContext.join("\n")}`
      : "";

    const systemPrompt = `You are an AI assistant providing clarifications on specific parts of previous responses. Be concise but thorough, and maintain the context of the conversation.`;

    const userPrompt = `The user has selected this text from a previous AI response: "${selectedText}"

Their clarification question: "${userQuestion}"${context}

Please provide a clear, helpful clarification that addresses their specific question while considering the context.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return (
      response.choices[0].message.content ||
      "I apologize, but I couldn't generate a clarification."
    );
  } catch (error) {
    console.error("Error generating clarification:", error);
    throw new Error("Failed to generate clarification");
  }
}
