/**
 * Programme Lookup API
 * 
 * GET /api/programmes?inst=<institutionId>&level=<degreeLevel>
 * 
 * Returns programmes for a specific institution and degree level.
 * Data is loaded from generated JSON files created by sync-duo-programmes script.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Programme, DegreeLevel } from '@/types/programme';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Load programme data for an institution
 */
async function loadInstitutionProgrammes(institutionId: string): Promise<Programme[] | null> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'programmes', `${institutionId}.json`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Return all programmes combined
    return [
      ...(data.bachelor || []),
      ...(data.premaster || []),
      ...(data.master || [])
    ];
  } catch (error) {
    // File doesn't exist or is invalid
    return null;
  }
}

/**
 * Load programmes for a specific level
 */
async function loadProgrammesByLevel(institutionId: string, level: DegreeLevel): Promise<Programme[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'programmes', `${institutionId}.json`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    return data[level] || [];
  } catch (error) {
    // File doesn't exist or is invalid
    return [];
  }
}

/**
 * GET /api/programmes
 * 
 * Query parameters:
 * - inst: Institution ID (required)
 * - level: Degree level - 'bachelor', 'premaster', or 'master' (required)
 * 
 * Returns:
 * - 200: { programmes: Programme[] }
 * - 400: Missing required parameters
 * - 404: Institution not found
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const institutionId = searchParams.get('inst');
  const level = searchParams.get('level') as DegreeLevel;

  // Validate required parameters
  if (!institutionId) {
    return NextResponse.json(
      { error: 'Missing required parameter: inst' },
      { status: 400 }
    );
  }

  if (!level || !['bachelor', 'premaster', 'master'].includes(level)) {
    return NextResponse.json(
      { error: 'Missing or invalid parameter: level (must be bachelor, premaster, or master)' },
      { status: 400 }
    );
  }

  try {
    const programmes = await loadProgrammesByLevel(institutionId, level);
    
    // Set cache headers (programmes are relatively static)
    const response = NextResponse.json({ programmes });
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    
    return response;
  } catch (error) {
    console.error('Error loading programmes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/programmes/all
 * 
 * Query parameters:
 * - inst: Institution ID (required)
 * 
 * Returns all programmes for an institution across all levels
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const institutionId = searchParams.get('inst');

  if (!institutionId) {
    return NextResponse.json(
      { error: 'Missing required parameter: inst' },
      { status: 400 }
    );
  }

  try {
    const programmes = await loadInstitutionProgrammes(institutionId);
    
    if (programmes === null) {
      return NextResponse.json(
        { programmes: [] },
        { status: 200 }
      );
    }
    
    const response = NextResponse.json({ programmes });
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    
    return response;
  } catch (error) {
    console.error('Error loading all programmes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
