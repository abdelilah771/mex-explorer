import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Log the credentials when the server starts
console.log('--- Cloudinary Config ---');
console.log('Cloud Name:', cloudName ? `${cloudName.substring(0, 4)}...` : 'Not Found');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 4)}...` : 'Not Found');
console.log('API Secret:', apiSecret ? 'Loaded' : 'Not Found');
console.log('-------------------------');

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const { folder = 'misc' } = await request.json();

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: folder,
      },
      apiSecret!
    );

    return NextResponse.json({
      signature,
      timestamp,
      api_key: apiKey!,
      cloud_name: cloudName!,
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json({ message: 'Error generating signature' }, { status: 500 });
  }
}