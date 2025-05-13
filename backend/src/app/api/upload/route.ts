import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../../../lib/auth';

// Handle preflight CORS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Process the form data
    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Create a unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename with original extension
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const fileName = `${uuidv4()}.${extension}`;
    
    // Define the path where the file will be saved
    const filePath = join(uploadsDir, fileName);
    
    // Ensure directory exists
    await mkdir(dirname(filePath), { recursive: true });
    
    // Save the file
    await writeFile(filePath, buffer);
    
    // Return the URL to the uploaded file
    const imageUrl = `/uploads/${fileName}`;
    
    const res = NextResponse.json({ 
      success: true, 
      imageUrl 
    });
    
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
    
  } catch (error) {
    console.error('Error uploading file:', error);
    const res = NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
  }
}