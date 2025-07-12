import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure thumbnails directory exists
    const thumbnailsDir = join(process.cwd(), 'public', 'thumbnails');
    await mkdir(thumbnailsDir, { recursive: true });

    // Write file to thumbnails directory
    const filePath = join(thumbnailsDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      filename: filename,
      path: `/thumbnails/${filename}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 