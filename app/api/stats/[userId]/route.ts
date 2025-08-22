import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const trips = await prisma.trip.findMany({
      where: { 
        members: {
          some: {
            userId: params.userId,
          }
        } 
      },
      orderBy: { travelStartDate: 'asc' },
    });

    const monthlyStats: { [key: string]: number } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = monthNames[d.getMonth()];
        monthlyStats[monthKey] = 0;
    }

    trips.forEach(trip => {
      const monthKey = monthNames[trip.travelStartDate.getMonth()];
      if (monthlyStats[monthKey] !== undefined) {
          monthlyStats[monthKey]++;
      }
    });
    
    const chartData = Object.entries(monthlyStats).map(([name, trips]) => ({
      month: name,
      trips,
    }));

    return NextResponse.json(chartData);

  } catch (error) {
    console.error('FETCH_STATS_ERROR', error);
    return NextResponse.json({ message: 'Error fetching statistics' }, { status: 500 });
  }
}