import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting analyze-food function");
    
    const { image } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    if (!image) {
      console.error('No image data received');
      throw new Error('No image data received');
    }

    console.log("Image data received, length:", image.length);

    // First, analyze the image using the vision model
    console.log("Calling OpenAI Vision API...");
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "You are a nutrition expert. Based on the visual appearance of the meal and your knowledge of plate and bowl sizes, estimate the types of food, ingredients, and their weights directly from what you see. Consider standard preparation methods and average values from established nutrition databases. Format your response as a JSON array of objects with 'name' and 'weight_g' properties."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
      })
    });

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json();
      console.error("Vision API Error:", errorData);
      throw new Error(`Vision API request failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const visionData = await visionResponse.json();
    console.log("Vision API raw response:", visionData);
    
    let foodList;
    try {
      foodList = JSON.parse(visionData.choices[0].message.content);
      console.log("Parsed food list:", foodList);
    } catch (parseError) {
      console.error("Error parsing vision response:", parseError);
      console.log("Raw content:", visionData.choices[0].message.content);
      throw new Error('Failed to parse food list from vision response');
    }

    // Now get nutritional information using GPT-4
    console.log("Calling OpenAI for nutrition analysis...");
    const nutritionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a nutrition expert. Based on the food items and their weights, provide accurate nutritional information using standard preparation methods and average values from established nutrition databases. Round values to the nearest whole number for clarity. Return ONLY a JSON object with a 'foods' array containing objects with properties: name, weight_g, nutrition (containing calories, protein, carbs, fat)."
          },
          {
            role: "user",
            content: `Please analyze these food items and provide nutritional information: ${JSON.stringify(foodList)}`
          }
        ],
      })
    });

    if (!nutritionResponse.ok) {
      const errorData = await nutritionResponse.json();
      console.error("Nutrition API Error:", errorData);
      throw new Error(`Nutrition API request failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const nutritionData = await nutritionResponse.json();
    console.log("Nutrition analysis raw response:", nutritionData);

    try {
      const content = nutritionData.choices[0].message.content;
      console.log("Raw nutrition content:", content);
      const parsedContent = JSON.parse(content);
      console.log("Parsed nutrition content:", parsedContent);
      
      if (!parsedContent.foods || !Array.isArray(parsedContent.foods)) {
        throw new Error('Invalid response format: missing foods array');
      }

      return new Response(JSON.stringify(parsedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error("Error parsing nutrition response:", parseError);
      throw new Error('Error processing the nutritional information');
    }
  } catch (error) {
    console.error("Error in analyze-food function:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});