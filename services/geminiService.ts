
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, Account, AccountType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsights = async (state: AppState) => {
  const prompt = `
    Analyze the following financial data and provide 3-4 concise insights or advice.
    Accounts: ${JSON.stringify(state.accounts)}
    Transactions (last few): ${JSON.stringify(state.transactions.slice(0, 10))}
    Debts: ${JSON.stringify(state.debts)}
    
    Format your response as a JSON array of objects with "title" and "description" fields.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return [{ title: "Error", description: "Could not generate insights." }];
  }
};

export const parseFinancialSetup = async (userInput: string): Promise<Partial<Account>[]> => {
  const prompt = `
    Extract bank accounts, wallets, or credit cards from this text: "${userInput}"
    Rules:
    - If it's a credit card or loan, set isLiability to true.
    - Types must be: BANK, WALLET, CASH, CREDIT_CARD, PAY_LATER.
    - Return a JSON array of objects with: name, balance (number), type (enum), isLiability (boolean), lastFourDigits (optional string).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              balance: { type: Type.NUMBER },
              type: { 
                type: Type.STRING, 
                enum: ["BANK", "WALLET", "CASH", "CREDIT_CARD", "PAY_LATER"] 
              },
              isLiability: { type: Type.BOOLEAN },
              lastFourDigits: { type: Type.STRING }
            },
            required: ["name", "balance", "type", "isLiability"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Setup Error:", error);
    return [];
  }
};
