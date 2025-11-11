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
 * Generic CKAN resolver for any DUO dataset
 * 
 * @param pkgId - DUO package ID (e.g., 'overzicht-erkenningen-ho', 'ho-opleidingsoverzicht')
 * @param preferNameRegex - Optional regex to prefer specific resource names
 * @returns Promise<string> The current CSV download URL
 * @throws Error if package lookup fails or no CSV resource found
 */
export async function resolveDuoCsv(pkgId: string, preferNameRegex?: RegExp): Promise<string> {
  const res = await fetch(`https://onderwijsdata.duo.nl/api/3/action/package_show?id=${encodeURIComponent(pkgId)}`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'DomuMatch/1.0 (programme-data-sync)'
    }
  });
  
  const json = await res.json();
  if (!json?.success) throw new Error(`DUO package_show failed for ${pkgId}`);
  
  const resources: any[] = json.result?.resources ?? [];
  const pick = (arr: any[]) =>
    arr.find(r => r.format?.toLowerCase() === 'csv' && (preferNameRegex?.test(r.name || '') || preferNameRegex?.test(r.url || '')))
    || arr.find(r => r.format?.toLowerCase() === 'csv');
    
  const csv = pick(resources);
  if (!csv?.url) throw new Error(`No CSV resource for ${pkgId}`);
  return csv.url as string;
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
  return resolveDuoCsv('overzicht-erkenningen-ho', /erkenningen|ho_erkenningen|overzicht.*ho/i);
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
