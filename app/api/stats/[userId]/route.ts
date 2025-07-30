import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    // 1. Fetch all trips for the specified user
    const trips = await prisma.trip.findMany({
      where: { userId: params.userId },
      orderBy: { travelStartDate: 'asc' },
    });

    // 2. Process the data to count trips per month for the last year
    const monthlyStats: { [key: string]: number } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Initialize stats for the last 12 months
    for (let i = 0; i < 12; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthlyStats[monthKey] = 0;
    }

    trips.forEach(trip => {
      if (trip.travelStartDate >= oneYearAgo) {
        const monthKey = `${monthNames[trip.travelStartDate.getMonth()]} ${trip.travelStartDate.getFullYear()}`;
        if (monthlyStats[monthKey] !== undefined) {
            monthlyStats[monthKey]++;
        }
      }
    });
    
    // 3. Format the data for the chart
    const chartData = Object.entries(monthlyStats).map(([name, trips]) => ({
      month: name.split(' ')[0], // Just get the month name
      trips,
    })).reverse(); // Reverse to show oldest month first

    return NextResponse.json(chartData, { status: 200 });

  } catch (error) {
    console.error('FETCH_STATS_ERROR', error);
    return NextResponse.json({ message: 'Error fetching statistics' }, { status: 500 });
  }
}