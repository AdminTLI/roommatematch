/**
 * Programme Lookup API
 * 
 * GET /api/programmes?inst=<institutionId>&level=<degreeLevel>
 * 
 * Returns programmes for a specific institution and degree level.
 * Data is loaded from the programmes database table.
 */

import { NextRequest, NextResponse } from 'next/server';
import { DegreeLevel } from '@/types/programme';
import { getProgrammesByInstitutionAndLevel, getAllProgrammesForInstitution } from '@/lib/programmes/repo';

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
 * - 500: Internal server error
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
    const programmes = await getProgrammesByInstitutionAndLevel(institutionId, level, true);
    
    // Set cache headers (programmes are relatively static)
    const response = NextResponse.json({ programmes });
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    
    return response;
  } catch (error) {
    console.error('Error loading programmes:', error);
    return NextResponse.json(
      { error: 'Internal server error', programmes: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/programmes/all
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
    const programmesByLevel = await getAllProgrammesForInstitution(institutionId, true);
    const programmes = [
      ...programmesByLevel.bachelor,
      ...programmesByLevel.premaster,
      ...programmesByLevel.master
    ];
    
    const response = NextResponse.json({ programmes });
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    
    return response;
  } catch (error) {
    console.error('Error loading all programmes:', error);
    return NextResponse.json(
      { error: 'Internal server error', programmes: [] },
      { status: 500 }
    );
  }
}
