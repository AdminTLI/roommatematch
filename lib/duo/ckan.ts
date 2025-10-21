/**
 * DUO CKAN API integration for resolving current CSV resources
 * 
 * DUO hosts their datasets on CKAN (onderwijsdata.duo.nl). This module provides
 * robust resolution of the current CSV URL for the "Overzicht Erkenningen ho" dataset
 * without hard-coding URLs that may change.
 */

export interface CkanResource {
  id: string;
  name: string;
  format: string;
  url: string;
  created: string;
  last_modified: string;
}

export interface CkanPackage {
  success: boolean;
  result: {
    id: string;
    name: string;
    title: string;
    resources: CkanResource[];
  };
}

/**
 * Resolve the current CSV resource for the dataset 'overzicht-erkenningen-ho' via CKAN.
 * 
 * The DUO "Overzicht Erkenningen ho" dataset contains all recognized HBO/WO programmes
 * and is updated daily. This function dynamically resolves the current CSV URL.
 * 
 * @returns Promise<string> The current CSV download URL
 * @throws Error if package lookup fails or no CSV resource found
 */
export async function resolveDuoErkenningenCsv(): Promise<string> {
  try {
    // 1) Ask CKAN for the package
    const response = await fetch('https://onderwijsdata.duo.nl/api/3/action/package_show?id=overzicht-erkenningen-ho', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoommateMatch/1.0 (programme-data-sync)'
      }
    });

    if (!response.ok) {
      throw new Error(`CKAN API request failed: ${response.status} ${response.statusText}`);
    }

    const pkg: CkanPackage = await response.json();
    
    if (!pkg?.success) {
      throw new Error('DUO package_show failed - invalid response structure');
    }

    // 2) Find the CSV resource (prefer name/format hints)
    const resources: CkanResource[] = pkg.result?.resources ?? [];
    
    if (resources.length === 0) {
      throw new Error('No resources found in DUO dataset');
    }

    // Look for CSV resource with specific naming patterns
    const csv = resources.find(r =>
      (r.format?.toLowerCase() === 'csv') &&
      (/erkenningen|ho_erkenningen|overzicht.*ho/i.test(r.name || '') || 
       /overzicht-erkenningen-ho/i.test(r.url || ''))
    ) || resources.find(r => r.format?.toLowerCase() === 'csv');

    if (!csv?.url) {
      throw new Error('No CSV resource found for Overzicht Erkenningen ho');
    }

    // DUO gives a direct download URL like .../resource/<id>/download/overzicht-erkenningen-ho.csv
    return csv.url as string;
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to resolve DUO CSV URL: ${error.message}`);
    }
    throw new Error('Unknown error resolving DUO CSV URL');
  }
}

/**
 * Get metadata about the current DUO dataset
 * 
 * @returns Promise<{url: string, lastModified: string, resourceCount: number}>
 */
export async function getDuoDatasetMetadata() {
  const url = await resolveDuoErkenningenCsv();
  
  const response = await fetch('https://onderwijsdata.duo.nl/api/3/action/package_show?id=overzicht-erkenningen-ho');
  const pkg: CkanPackage = await response.json();
  
  const csvResource = pkg.result?.resources?.find(r => r.url === url);
  
  return {
    url,
    lastModified: csvResource?.last_modified || 'unknown',
    resourceCount: pkg.result?.resources?.length || 0,
    datasetTitle: pkg.result?.title || 'Overzicht Erkenningen ho'
  };
}
