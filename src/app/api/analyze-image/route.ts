import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  // Check if API key exists
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured');
    return NextResponse.json(
      { error: 'OpenAI API key is missing. Please check your .env.local file.' },
      { status: 500 }
    );
  }

  // Initialize OpenAI client
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
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image concisely." },
            {
              type: "image_url",
              image_url: {
                url: `data:${image.type};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    return NextResponse.json({
      description: response.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image. Error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}