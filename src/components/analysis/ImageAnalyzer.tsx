import { toast } from "sonner";

interface ImageAnalyzerProps {
  apiKey: string;
  setNutritionData: (data: any) => void;
  saveFoodEntries: (foods: any[]) => Promise<void>;
}

export const analyzeImage = async (
  image: File,
  { apiKey, setNutritionData, saveFoodEntries }: ImageAnalyzerProps
) => {
  console.log("Starting image analysis with file:", image.name, image.type, image.size);
  
  const base64Image = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(image);
  });

  console.log("Image converted to base64");

  try {
    console.log("Sending request to OpenAI API");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert nutritionist and image recognition specialist analyzing food photos."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this meal photo following these steps carefully:

1. Food Identification:
   - Identify all visible items
   - Categorize each food item specifically (e.g., chicken breast vs. whole chicken)

2. Weight Estimation:
   - Estimate weight in grams for each item
   - Use reasonable portion sizes based on visible cues

3. Nutritional Information:
   - Calculate macronutrients based on weight
   - Use standard nutritional values

4. Contextual Consistency:
   - Assume standard preparation methods
   - Default to healthier preparation when ambiguous

Provide output in this exact JSON format:
{
    "foods": [
        {
            "name": "food name",
            "weight_g": number,
            "state": "liquid|solid",
            "nutrition": {
                "calories": number,
                "protein": number,
                "carbs": number,
                "fat": number
            }
        }
    ]
}

Important guidelines:
- Be specific with food names (e.g., "chicken breast" not just "chicken")
- Use only "liquid" or "solid" for state
- All numerical values should be numbers, not strings
- Round weights to nearest gram
- Include all visible food items
- Use standard nutritional databases for calculations`
              },
              {
                type: "image_url",
                image_url: {
                  "url": `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", responseData);
      
      // Check for quota exceeded error
      if (responseData.error?.code === "insufficient_quota" || 
          responseData.error?.type === "insufficient_quota") {
        toast.error("OpenAI API quota exceeded. Please check your billing details or try again later.", {
          duration: 5000,
        });
        throw new Error("OpenAI API quota exceeded");
      }
      
      // Handle other API errors
      const errorMessage = responseData.error?.message || 'Error analyzing image';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log('OpenAI API Response:', responseData);
    
    try {
      const content = responseData.choices[0].message.content;
      console.log('GPT Response:', content);
      
      const cleanedContent = content.replace(/```json\n|\n```/g, '');
      const result = JSON.parse(cleanedContent);
      
      if (!result.foods || !Array.isArray(result.foods)) {
        throw new Error('Invalid response format: missing foods array');
      }

      result.foods.forEach((food: any, index: number) => {
        if (!food.name || typeof food.weight_g !== 'number' || !food.nutrition) {
          throw new Error(`Invalid food item at index ${index}`);
        }
        if (food.state !== 'liquid' && food.state !== 'solid') {
          food.state = 'solid'; // Default to solid if invalid
        }
      });

      setNutritionData(result);
      await saveFoodEntries(result.foods);
      toast.success("Food analysis complete!");
      return result;
    } catch (error) {
      console.error('Error parsing GPT response:', error);
      toast.error('Failed to parse the analysis results');
      throw new Error('Invalid response format from GPT');
    }
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    throw error;
  }
};