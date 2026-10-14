import "dotenv/config";
import fetch from "node-fetch";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_MODEL = "gpt2-large";

/**
 * Generate text using HuggingFace models via the new router endpoint
 * @param {string} prompt - The input prompt
 * @param {object} options - Optional generation parameters
 * @returns {Promise<string>} - Generated text
 */
export async function hfTextGeneration(prompt, options = {}) {
    const url = `https://router.huggingface.co/models/${HUGGINGFACE_MODEL}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: options
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`HuggingFace API error: ${err}`);
    }

    const data = await response.json();

    // For text-generation or text2text-generation models
    if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
    }

    // For other models, return raw data
    return data;
}

// Example usage
(async () => {
    try {
        const result = await hfTextGeneration("Write a short poem about the sea.", { max_new_tokens: 50 });
        console.log("Generated Text:", result);
    } catch (error) {
        console.error(error.message);
    }
})();