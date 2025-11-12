const AI_BACKEND_URL = "https://ai-backend-1-awkq.onrender.com";

export interface TextChatRequest {
  text_input: string;
}

export interface ImageChatRequest {
  text_input: string;
  image_url: string;
}

export interface AIResponse {
  response: string;
}

export const aiChatApi = {
  /**
   * Send text message to AI chatbot
   * @param textInput - User's text input
   */
  sendTextMessage: async (textInput: string): Promise<AIResponse> => {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/textinput`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text_input: textInput,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error sending text message to AI:", error);
      throw error;
    }
  },

  /**
   * Send image with text to AI chatbot
   * @param textInput - User's text input
   * @param imageUrl - URL of the uploaded image
   */
  sendImageMessage: async (
    textInput: string,
    imageUrl: string
  ): Promise<AIResponse> => {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/imagerequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text_input: textInput,
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error sending image message to AI:", error);
      throw error;
    }
  },
};

