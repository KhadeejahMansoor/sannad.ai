import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.VOYAGE_API_KEY;
  return NextResponse.json({
    present: !!key,
    length: key ? key.length : 0,
    prefix: key ? key.slice(0, 3) : null,
  });
}