
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { Category, GeminiCategorization, ShoppingRecommendation, GroundingChunk, ClothingItem } from "../types";

export class QuotaExceededError extends Error {
  constructor(message: string = "API rate limit exceeded. Please wait a moment.") {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export class ApiKeyError extends Error {
  constructor(message: string = "API Key error. Please re-select your key.") {
    super(message);
    this.name = 'ApiKeyError';
  }
}

/**
 * Model-aware Throttling Manager
 */
class GlobalRequestManager {
  private static queue: Promise<any> = Promise.resolve();
  private static nextAvailablePro = 0;
  private static nextAvailableFlash = 0;
  
  // Safety buffers for Free Tier (2 RPM for Pro, 15 RPM for Flash)
  private static PRO_COOLDOWN = 32000; 
  private static FLASH_COOLDOWN = 5000;

  static getNextAvailableTime(type: 'pro' | 'flash'): number {
    return type === 'pro' ? this.nextAvailablePro : this.nextAvailableFlash;
  }

  static async enqueue<T>(type: 'pro' | 'flash', operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue = this.queue.then(async () => {
        try {
          const now = Date.now();
          const targetTime = type === 'pro' ? this.nextAvailablePro : this.nextAvailableFlash;
          
          if (now < targetTime) {
            const wait = targetTime - now;
            console.log(`[Throttler] Waiting ${Math.round(wait/1000)}s for ${type} window...`);
            await new Promise(r => setTimeout(r, wait));
          }

          const result = await this.executeWithRetry(operation);
          
          // Update cooldown for the track
          const cooldown = type === 'pro' ? this.PRO_COOLDOWN : this.FLASH_COOLDOWN;
          const nextTime = Date.now() + cooldown;
          
          if (type === 'pro') this.nextAvailablePro = nextTime;
          else this.nextAvailableFlash = nextTime;

          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  private static async executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.response?.status;
        const message = (err?.message || "").toLowerCase();

        if (message.includes("requested entity was not found") || message.includes("api key not found")) {
          throw new ApiKeyError();
        }

        const isQuota = status === 429 || message.includes("429") || message.includes("resource_exhausted") || message.includes("quota");
        
        if (isQuota) {
          // If we hit a 429 despite our throttling, force a long reset
          const resetDelay = 60000; 
          this.nextAvailablePro = Date.now() + resetDelay;
          this.nextAvailableFlash = Date.now() + resetDelay;
          
          if (i < maxRetries - 1) {
            console.warn(`[Throttler] Quota hit! Forcing 60s reset.`);
            await new Promise(r => setTimeout(r, resetDelay));
            continue;
          } else {
            throw new QuotaExceededError();
          }
        }
        
        if ((status === 503 || status === 504) && i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }

        throw err;
      }
    }
    throw lastError;
  }
}

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Pro Models
export const generateImage = async (prompt: string, aspectRatio: string = "1:1", size: string = "1K") => {
  return GlobalRequestManager.enqueue('pro', async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        imageConfig: { aspectRatio: aspectRatio as any, imageSize: size as any },
        tools: [{ googleSearch: {} }] 
      }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Generation failed");
  });
};

export const askStylistDeep = async (message: string) => {
  return GlobalRequestManager.enqueue('pro', async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: message,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: "You are a senior fashion director. Analyze the user request with extreme depth, considering archival fashion, color theory, and lifestyle constraints."
      }
    });
    return response.text;
  });
};

export const generateStyleVideo = async (prompt: string): Promise<string> => {
  return GlobalRequestManager.enqueue('pro', async () => {
    const ai = getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  });
};

export const getShoppingRecommendations = async (items: ClothingItem[]): Promise<ShoppingRecommendation> => {
  return GlobalRequestManager.enqueue('pro', async () => {
    const ai = getAI();
    const wardrobeContext = items.map(i => `${i.category}: ${i.color} (${i.tags.join(', ')})`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `User Wardrobe:\n${wardrobeContext}\nAnalyze style DNA, identify gaps, and suggest investments with Google Search grounding. Return JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            wardrobeAnalysis: { type: Type.STRING },
            styleProfile: {
              type: Type.OBJECT,
              properties: {
                dominantColors: { type: Type.ARRAY, items: { type: Type.STRING } },
                topOccasions: { type: Type.ARRAY, items: { type: Type.STRING } },
                coreAesthetic: { type: Type.STRING }
              }
            },
            gaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { category: { type: Type.STRING }, reason: { type: Type.STRING } }
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemType: { type: Type.STRING },
                  whyItFits: { type: Type.STRING },
                  stylingIdea: { type: Type.STRING }
                }
              }
            },
            brandMatches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  style: { type: Type.STRING },
                  url: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    const result = JSON.parse(response.text || '{}');
    result.sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return result as ShoppingRecommendation;
  });
};

// Flash Models
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  return GlobalRequestManager.enqueue('flash', async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return part.inlineData.data;
    }
    return base64Image;
  });
};

export const fastAnalyze = async (text: string) => {
  return GlobalRequestManager.enqueue('flash', async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: text
    });
    return response.text;
  });
};

export const findLocalBoutiques = async (location: { lat: number, lng: number }) => {
  return GlobalRequestManager.enqueue('flash', async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "What are the best independent clothing boutiques or tailors nearby?",
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: location.lat, longitude: location.lng }
          }
        }
      }
    });
    return {
      text: response.text,
      places: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  });
};

export const analyzeClothingImage = async (base64Image: string): Promise<GeminiCategorization> => {
  return GlobalRequestManager.enqueue('flash', async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [{ parts: [{ inlineData: { data: base64Image, mimeType: 'image/jpeg' } }, { text: "Categorize this clothing item. Return JSON: category, color, season, occasion, tags." }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, color: { type: Type.STRING }, season: { type: Type.ARRAY, items: { type: Type.STRING } }, occasion: { type: Type.ARRAY, items: { type: Type.STRING } }, tags: { type: Type.ARRAY, items: { type: Type.STRING } } } }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const separateClothingItems = async (base64Image: string): Promise<{ items: any[] }> => {
  return GlobalRequestManager.enqueue('flash', async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { parts: [{ inlineData: { data: base64Image, mimeType: 'image/jpeg' } }, { text: "Detect and separate distinct clothing items in this photo. Return a JSON list of items with their category, color, and metadata." }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  color: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  season: { type: Type.ARRAY, items: { type: Type.STRING } },
                  occasion: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    });
    const parsed = JSON.parse(response.text || '{"items": []}');
    return {
      items: (parsed.items || []).map((item: any) => ({ ...item, image: base64Image }))
    };
  });
};

export const cleanImageBackground = async (base64Image: string): Promise<string> => {
  return GlobalRequestManager.enqueue('flash', async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ inlineData: { data: base64Image, mimeType: 'image/jpeg' } }, { text: 'Remove background, pure white.' }] }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return part.inlineData.data;
    }
    return base64Image;
  });
};

export const suggestOutfits = async (items: any[], prompt: string): Promise<string[][]> => {
  return GlobalRequestManager.enqueue('flash', async () => {
    const ai = getAI();
    const itemsText = items.map(i => `ID:${i.id}, ${i.category}, ${i.color}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Wardrobe:\n${itemsText}\nSuggest 3 outfits for "${prompt}". JSON array of ID arrays.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  });
};

export const playAudioResponse = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
    },
  });
  const b64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) return;

  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const buffer = await decodeAudioData(decodeBase64(b64), ctx, 24000, 1);
  const s = ctx.createBufferSource();
  s.buffer = buffer;
  s.connect(ctx.destination);
  s.start();
};

export const startLiveConsult = async (onText: (t: string, m: boolean) => void) => {
  const ai = getAI();
  const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  let nextTime = 0;
  const sources = new Set<AudioBufferSourceNode>();

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onmessage: async (msg: LiveServerMessage) => {
        if (msg.serverContent?.outputTranscription) onText(msg.serverContent.outputTranscription.text, true);
        if (msg.serverContent?.inputTranscription) onText(msg.serverContent.inputTranscription.text, false);
        
        const b64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (b64) {
          nextTime = Math.max(nextTime, outCtx.currentTime);
          const buffer = await decodeAudioData(decodeBase64(b64), outCtx, 24000, 1);
          const s = outCtx.createBufferSource();
          s.buffer = buffer;
          s.connect(outCtx.destination);
          s.start(nextTime);
          nextTime += buffer.duration;
          sources.add(s);
        }
        if (msg.serverContent?.interrupted) {
          sources.forEach(s => s.stop());
          sources.clear();
          nextTime = 0;
        }
      }
    },
    config: {
      responseModalities: [Modality.AUDIO],
      outputAudioTranscription: {},
      inputAudioTranscription: {},
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
    }
  });

  const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
  const inCtx = new AudioContext({ sampleRate: 16000 });
  const node = inCtx.createScriptProcessor(4096, 1, 1);
  node.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0);
    const i16 = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) i16[i] = input[i] * 32768;
    sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encodeBase64(new Uint8Array(i16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
  };
  inCtx.createMediaStreamSource(mic).connect(node);
  node.connect(inCtx.destination);

  return { stop: () => { mic.getTracks().forEach(t => t.stop()); inCtx.close(); outCtx.close(); sessionPromise.then(s => s.close()); } };
};

export const getWaitTime = (type: 'pro' | 'flash'): number => {
  const wait = GlobalRequestManager.getNextAvailableTime(type) - Date.now();
  return wait > 0 ? Math.ceil(wait / 1000) : 0;
};

function decodeBase64(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function encodeBase64(bytes: Uint8Array) {
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, rate: number, chans: number): Promise<AudioBuffer> {
  const i16 = new Int16Array(data.buffer);
  const count = i16.length / chans;
  const buffer = ctx.createBuffer(chans, count, rate);
  for (let c = 0; c < chans; c++) {
    const d = buffer.getChannelData(c);
    for (let i = 0; i < count; i++) d[i] = i16[i * chans + c] / 32768.0;
  }
  return buffer;
}
