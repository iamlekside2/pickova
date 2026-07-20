import type { ProductImporter } from "./types";
import { metadataImporter } from "./metadata";
import { brightDataImporter, isBrightDataConfigured } from "./brightdata";

// Pluggable importer registry.
// - metadata:  free OG/JSON-LD parse (open sites)
// - brightdata: Web Unlocker for bot-protected retailers (needs BRIGHTDATA_API_KEY)
// Future: supplier CSV/API importers add here without touching the admin flow.
const IMPORTERS: Record<string, ProductImporter> = {
  metadata: metadataImporter,
  brightdata: brightDataImporter,
};

export function getImporter(key = "metadata"): ProductImporter {
  return IMPORTERS[key] ?? metadataImporter;
}

export { isBrightDataConfigured };
