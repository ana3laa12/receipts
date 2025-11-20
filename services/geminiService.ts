
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Use Flash for fast vision analysis
const VISION_MODEL_NAME = 'gemini-2.5-flash';
// Keep Pro for complex medical reasoning in chat
const CHAT_MODEL_NAME = 'gemini-3-pro-preview';

const cleanJsonText = (text: string): string => {
  return text.replace(/```json\s*|```/g, '').trim();
};

const formatPrice = (price: string | number): string => {
  if (!price) return '0';
  // Remove non-numeric characters except dot
  const cleanStr = String(price).replace(/[^0-9.]/g, '');
  let num = parseFloat(cleanStr);
  if (isNaN(num)) return '0';

  // User Rule: Value is strictly between 100 and 3000.
  // Fix OCR Error: "150.00" often becomes "15000" (extra zeros).
  // We divide by 10 until it falls within the realistic max limit (3000).
  while (num > 3000) {
    num = num / 10;
  }

  // Return as integer string (removes decimals like .00)
  return Math.round(num).toString();
};

export const analyzeInvoiceImage = async (base64Image: string, lang: 'ar' | 'en' = 'ar'): Promise<any[]> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const promptText = lang === 'ar' 
      ? "Analyze this image. Identify ALL medical invoices visible in the image. For EACH invoice found, extract the following fields: patientName (keep Arabic if present), procedure (medical service), price (numeric value only, no currency symbols, no decimals, e.g. 150), date (YYYY-MM-DD), dayName (The Arabic name of the day corresponding to the date, e.g., السبت. If date is missing, leave empty). If a field is missing for a specific invoice, return 'غير متوفر'. Return a strict JSON Array."
      : "Analyze this image. Identify ALL medical invoices visible in the image. For EACH invoice found, extract the following fields: patientName (transliterate to English if Arabic), procedure (medical service in English), price (numeric value only, no currency symbols, no decimals, e.g. 150), date (YYYY-MM-DD), dayName (The English name of the day corresponding to the date, e.g., Saturday. If date is missing, leave empty). If a field is missing, return 'Unknown'. Return a strict JSON Array.";

    const response = await ai.models.generateContent({
      model: VISION_MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
          {
            text: promptText
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              patientName: { type: Type.STRING },
              procedure: { type: Type.STRING },
              price: { type: Type.STRING },
              date: { type: Type.STRING },
              dayName: { type: Type.STRING },
            },
            required: ["patientName", "procedure", "price", "date", "dayName"],
          },
        },
      },
    });

    if (response.text) {
      const cleanedText = cleanJsonText(response.text);
      const result = JSON.parse(cleanedText);
      const items = Array.isArray(result) ? result : [result];
      
      // Post-process items to enforce price format and specific business rules
      return items.map((item: any) => {
        const procedureLower = (item.procedure || '').toLowerCase().trim();

        // Business Rule: Examination/Checkup is ALWAYS 130
        // Checks for Arabic "كشف" or English equivalents
        if (procedureLower.includes('كشف') ||
            procedureLower.includes('examination') ||
            procedureLower.includes('consultation') ||
            procedureLower.includes('checkup') ||
            procedureLower.includes('check-up')) {
          return {
            ...item,
            price: '130'
          };
        }

        return {
          ...item,
          price: formatPrice(item.price)
        };
      });
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Error analyzing invoice:", error);
    throw error;
  }
};

export const getChatResponse = async (history: {role: string, parts: {text: string}[]}[], newMessage: string, lang: 'ar' | 'en' = 'ar') => {
  try {
    const systemInstruction = lang === 'ar'
      ? "أنت مساعد طبي ذكي ومفيد. تتحدث اللغة العربية بطلاقة وتساعد المستخدمين في فهم الفواتير الطبية، المصطلحات الطبية، وتقديم نصائح عامة. جاوب دائمًا باللغة العربية."
      : "You are a smart and helpful medical assistant. You speak English fluently and help users understand medical invoices, medical terms, and provide general advice. Always answer in English.";

    const chat = ai.chats.create({
      model: CHAT_MODEL_NAME,
      history: history,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};
