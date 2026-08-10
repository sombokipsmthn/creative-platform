// src/app/api/drive/scan/route.ts
import { NextResponse } from 'next/server';

// List of Google Drive Folder IDs you want to scan
// (Copy the Folder ID from the URL of each Google Drive folder)
const DRIVE_FOLDER_IDS = [
  'FOLDER_ID_1_PHOTOGRAPHY',
  'FOLDER_ID_2_CAMPAIGNS',
  'FOLDER_ID_3_VISUAL_IDENTITY',
];

export async function GET() {
  try {
    const googleApiKey = process.env.GOOGLE_DRIVE_API_KEY;
    const allImages: Array<{ id: string; name: string; url: string }> = [];

    // Scan each Google Drive folder
    for (const folderId of DRIVE_FOLDER_IDS) {
      if (folderId.startsWith('FOLDER_ID_')) continue; // Skip placeholder IDs

      // Fetch file list inside the folder using Google Drive API v3
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType+contains+'image/'+and+trashed=false&fields=files(id,name,mimeType)&key=${googleApiKey}`,
        { next: { revalidate: 3600 } } // Cache results for 1 hour for fast page loads
      );

      if (res.ok) {
        const data = await res.json();
        const files = data.files || [];

        // Format direct display URLs
        const images = files.map((file: any) => ({
          id: file.id,
          name: file.name.replace(/\.[^/.]+$/, ''), // Clean file extension
          url: `https://lh3.googleusercontent.com/d/${file.id}`,
        }));

        allImages.push(...images);
      }
    }

    return NextResponse.json({
      success: true,
      totalCount: allImages.length,
      images: allImages,
    });
  } catch (error: any) {
    console.error('Drive Scan Error:', error);
    return NextResponse.json(
      { error: 'Failed to scan Google Drive folders' },
      { status: 500 }
    );
  }
}