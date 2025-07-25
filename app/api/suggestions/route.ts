import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { tripId } = await request.json();
    if (!tripId) {
      return NextResponse.json({ message: 'Trip ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });

    if (!user || !trip) {
      return NextResponse.json({ message: 'User or Trip not found' }, { status: 404 });
    }

    const prompt = `
      You are an expert tour guide for Marrakech, Morocco.
      A traveler has given you their preferences. Please create 4 distinct, personalized daily itineraries.
      
      Traveler's Profile:
      - Interests: ${user.interests?.join(', ')}
      - Travel Style: ${user.travelStyle}
      - Activity Level: ${user.activityLevel}

      Trip Details:
      - Start Date: ${trip.travelStartDate.toDateString()}
      - End Date: ${trip.travelEndDate.toDateString()}
      - Estimated Budget: $${trip.budget}
      - Desired Souvenir: ${trip.souvenirType || 'None specified'}

      Your Task:
      Generate 4 complete, distinct, and highly personalized trip proposals. For each proposal, provide a full day-by-day itinerary.
      
      IMPORTANT: Consider the specific dates of travel (${trip.travelStartDate.toDateString()} to ${trip.travelEndDate.toDateString()}). If there are any local holidays, festivals, or special seasonal events in Marrakech during this period, please include them in your suggestions.
      
      Respond with ONLY a valid JSON object. The JSON object should have a single key "proposals" which is an array of 4 proposal objects.
      Each proposal object must have the following structure:
      {
        "title": "A descriptive title for the proposal (e.g., 'The Adventurous Foodie's Journey')",
        "summary": "A brief one-paragraph summary of this trip proposal.",
        "itinerary": [
          {
            "day": 1,
            "theme": "A theme for the day (e.g., 'Exploring the Medina')",
            "morning": "Description of the morning activity. Include specific names.",
            "afternoon": "Description of the afternoon activity. Include specific names.",
            "evening": "Description of the evening activity, including a specific restaurant name and why it was chosen."
          }
        ]
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let aiResponse;
    // Retry Logic for API calls
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanedJson = text.replace(/^```json\s*|```\s*$/g, '');
        aiResponse = JSON.parse(cleanedJson);
        break; // Exit loop on success
      } catch (error: any) {
        if (error.message.includes('503')) {
          attempts++;
          if (attempts >= maxAttempts) throw error;
          console.log(`Model overloaded. Retrying in ${attempts * 2} seconds...`);
          await sleep(attempts * 2000);
        } else {
          throw error;
        }
      }
    }
    if (!aiResponse) throw new Error('Failed to get a response from the AI model.');

    // --- NEW: Save the suggestions to the database ---
    await prisma.$transaction(
      aiResponse.proposals.map((proposal: any) =>
        prisma.suggestion.create({
          data: {
            title: proposal.title,
            summary: proposal.summary,
            itinerary: proposal.itinerary, // Prisma handles the JSON object
            tripId: trip.id, // Link to the trip
          },
        })
      )
    );

    return NextResponse.json(aiResponse, { status: 200 });

  } catch (error) {
    console.error('SUGGESTION_GENERATION_ERROR', error);
    return NextResponse.json({ message: 'Error generating suggestions' }, { status: 500 });
  }
}