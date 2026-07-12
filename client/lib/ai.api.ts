import { api } from "./api";

export interface AIAskRequest {
  prompt: string;
}

export interface AIAskResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export const aiApi = {
  askAssistant: async (data: AIAskRequest) => {
    // Return the full response object so we can handle errors on the client gracefully
    return await api.post<AIAskResponse>("/ai/ask", data);
  },
};
