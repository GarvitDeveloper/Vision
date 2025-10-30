
import { GoogleGenAI, Type } from "@google/genai";
import type { ItemInfo, DiscoveryItem, Geolocation } from '../types';

const base64ToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64.split(',')[1],
      mimeType
    },
  };
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const infoModel = 'gemini-2.5-pro';
const imageModel = 'imagen-4.0-generate-001';

const infoSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'The common name of the item.' },
    category: { type: Type.STRING, description: "The category of the item. Must be one of: 'Animal', 'Plant', 'Food', 'Object', 'Landmark', 'Artwork', 'Vehicle', 'Fashion', 'Other'." },
    confidence: { type: Type.NUMBER, description: 'A score from 0 to 100 representing the confidence in the identification.' },
    description: { type: Type.STRING, description: 'A fascinating and concise paragraph about the item.' },
    funFact: { type: Type.STRING, description: 'A single, surprising "Did you know?" style fun fact.' },
    imagePrompt: { type: Type.STRING, description: 'A detailed prompt for an image generation model to create a high-quality, photorealistic image of this item, often in its natural context.' },
    scientificName: { type: Type.STRING, description: 'The scientific name (binomial nomenclature) if it is a plant or animal.' },
    habitat: { type: Type.STRING, description: 'A description of the natural habitat if it is a plant or animal.' },
    diet: { type: Type.STRING, description: 'A description of the diet if it is an animal.' },
    lifespan: { type: Type.STRING, description: 'The typical lifespan if it is a plant or animal.' },
    conservationStatus: { type: Type.STRING, description: 'The current conservation status if it is a plant or animal.' },
    cuisine: { type: Type.STRING, description: 'The cuisine or origin of the food item.' },
    ingredients: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: 'A list of key ingredients if it is a food item.' 
    },
    material: { type: Type.STRING, description: 'The primary material the object is made from.' },
    era: { type: Type.STRING, description: 'The historical period or era the object is from, if applicable.' },
  },
  required: ['name', 'category', 'confidence', 'description', 'funFact', 'imagePrompt'],
};

export const identifyItem = async (imageBase64: string): Promise<ItemInfo> => {
  try {
    const imagePart = base64ToGenerativePart(imageBase64, 'image/jpeg');
    const infoPrompt = "You are a world-class expert in identifying anything. Analyze the attached image to identify what it is. Provide a confidence score, categorize it (from 'Animal', 'Plant', 'Food', 'Object', 'Landmark', 'Artwork', 'Vehicle', 'Fashion', 'Other'), and respond with the requested JSON object containing detailed, engaging, and accurate information relevant to its category.";
    
    const infoResponse = await ai.models.generateContent({
      model: infoModel,
      contents: { parts: [imagePart, { text: infoPrompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: infoSchema,
      },
    });

    const infoJsonText = infoResponse.text.trim();
    if (!infoJsonText) {
      throw new Error('API returned empty response for item information.');
    }
    
    const parsedInfo = JSON.parse(infoJsonText);

    if (!parsedInfo.name || !parsedInfo.imagePrompt) {
        throw new Error('Failed to parse required fields from API response.');
    }
    
    // Generate the image in parallel
    const imagePromise = ai.models.generateImages({
        model: imageModel,
        prompt: parsedInfo.imagePrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        }
    });

    const [imageResponse] = await Promise.all([imagePromise]);

    const generatedImage = imageResponse.generatedImages[0];
    if (!generatedImage?.image?.imageBytes) {
        throw new Error('Failed to generate item image.');
    }

    const imageUrl = `data:image/jpeg;base64,${generatedImage.image.imageBytes}`;

    return {
      ...parsedInfo,
      imageUrl,
    };

  } catch (error) {
    console.error('Error identifying item:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to identify item: ${error.message}`);
    }
    throw new Error('An unknown error occurred while identifying the item.');
  }
};


const discoverySchema = {
    type: Type.OBJECT,
    properties: {
        discoveries: {
            type: Type.ARRAY,
            description: "An array of 3-5 discovery items.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: 'A catchy title for the discovery item.' },
                    description: { type: Type.STRING, description: 'A one or two sentence description or fact.' },
                    category: { type: Type.STRING, description: "The category. Must be one of: 'Local Discovery', 'Fun Fact', 'Challenge'." }
                },
                required: ['title', 'description', 'category']
            }
        }
    },
    required: ['discoveries']
};

export const getDiscoveryContent = async (location: Geolocation | null): Promise<DiscoveryItem[]> => {
    try {
        let prompt = "You are a creative content generator for a discovery app. Generate 3-5 engaging items for users to discover. Mix categories between 'Fun Fact', 'Challenge', and 'Local Discovery'.";
        if (location) {
            prompt += ` The user is currently near latitude ${location.lat} and longitude ${location.lng}. For 'Local Discovery' items, suggest things (plants, animals, landmarks) they might find in that specific area. For 'Challenge' items, suggest something they can try to find and scan with the app.`;
        } else {
            prompt += " Since location is not available, focus on general 'Fun Fact' and 'Challenge' items. For 'Challenge' items, suggest something they can try to find and scan with the app (e.g., 'Find a red flower').";
        }

        const response = await ai.models.generateContent({
            model: infoModel,
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: discoverySchema,
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error('API returned empty response for discovery content.');
        }

        const parsedResponse = JSON.parse(jsonText);
        if (!parsedResponse.discoveries) {
            throw new Error('Failed to parse discoveries from API response.');
        }

        return parsedResponse.discoveries;

    } catch (error) {
        console.error('Error getting discovery content:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to get discovery content: ${error.message}`);
        }
        throw new Error('An unknown error occurred while getting discovery content.');
    }
};