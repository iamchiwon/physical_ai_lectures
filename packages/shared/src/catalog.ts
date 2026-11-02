import { catalogData } from "./catalog-data";
import { catalogSchema } from "./catalog-schema";

/** Validate at registration; app consumers share stable IDs and asset references. */
export const catalog = catalogSchema.parse(catalogData);
export * from "./catalog-schema";
export * from "./catalog-readiness";
