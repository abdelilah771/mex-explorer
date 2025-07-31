import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Helper function to call Google Geocoding API
async function getCoordinates(placeName: string) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        placeName + ', Marrakech, Morocco'
      )}&key=${process.env.NEXT_PUBLIC_Maps_API_KEY}`
    );
    const data = await response.json();
    if (data.status === 'OK') {
      return data.results[0].geometry.location; // Returns { lat, lng }
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { tripId } = await request.json();
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });

    if (!user || !trip) {
      return NextResponse.json({ message: 'User or Trip not found' }, { status: 404 });
    }

    // --- UPDATED PROMPT ---
    const prompt = `
      You are an expert tour guide for Marrakech. Create 4 distinct itineraries.
      For each activity (morning, afternoon, evening), provide a "description" and a specific "locationName" suitable for geocoding (e.g., "Jardin Majorelle", "Nomad Restaurant").

      Respond with ONLY a valid JSON object with a key "proposals".
      Each proposal object must have an "itinerary" array. Each itinerary object must have this structure:
      {
        "day": 1,
        "theme": "A theme for the day",
        "morning": { "description": "...", "locationName": "..." },
        "afternoon": { "description": "...", "locationName": "..." },
        "evening": { "description": "...", "locationName": "..." }
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedJson = text.replace(/^```json\s*|```\s*$/g, '');
    const suggestions = JSON.parse(cleanedJson);

    // --- NEW: Enrich with Coordinates ---
    for (const proposal of suggestions.proposals) {
      for (const day of proposal.itinerary) {
        day.morning.coords = await getCoordinates(day.morning.locationName);
        day.afternoon.coords = await getCoordinates(day.afternoon.locationName);
        day.evening.coords = await getCoordinates(day.evening.locationName);
      }
    }

    // Save the enriched suggestions to the database
    await prisma.$transaction(
      suggestions.proposals.map((p: any) =>
        prisma.suggestion.create({
          data: {
            title: p.title,
            summary: p.summary,
            itinerary: p.itinerary, // Now includes coordinates
            tripId: trip.id,
          },
        })
      )
    );

    return NextResponse.json(suggestions, { status: 200 });

  } catch (error) {
    console.error('SUGGESTION_GENERATION_ERROR', error);
    return NextResponse.json({ message: 'Error generating suggestions' }, { status: 500 });
  }
}