import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

export async function POST(request: Request) {
  // Configure marked options using only standard options
  marked.setOptions({
    gfm: true,
    breaks: true,
    pedantic: false,
  });

  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured');
    return NextResponse.json(
      { error: 'OpenAI API key is missing. Please check your .env.local file.' },
      { status: 500 }
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const formData = await request.formData();
    const image = formData.get('image') as Blob | null;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this bathroom image as a renovation expert. Identify:\n" +
                    "1. **Current Fixtures**\n" +
                    "   - Toilet\n" +
                    "   - Shower/Tub\n" +
                    "   - Sink\n" +
                    "2. **Existing Materials**\n" +
                    "   - Tile types\n" +
                    "   - Wood\n" +
                    "   - Stone elements\n" +
                    "3. **Approximate Size/Layout**\n" +
                    "4. **Current Condition and Age Estimation**\n" +
                    "5. **Notable Features or Issues**\n" +
                    "\nFormat as a concise, structured assessment with markdown formatting. Do not exceed 200 words."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${image.type};base64,${base64Image}`,
                detail: "high"
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    // Safely get the raw content from the response
    const rawContent = response.choices[0]?.message?.content?.trim() || '';

    // Wrap the content in a div to ensure it's treated as HTML
    const wrappedHtml = `<div class="bathroom-analysis">${marked.parse(rawContent)}</div>`;

    return NextResponse.json({
      analysis: wrappedHtml,
      message: "Bathroom analysis complete. Would you like to proceed with style and budget preferences?"
    });
  } catch (error) {
    console.error('Error processing bathroom image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze bathroom',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}