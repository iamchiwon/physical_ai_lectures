import { catalogData } from "./catalog-data";
import { catalogSchema } from "./catalog-schema";
import { applyAuthoredOverlay } from "./authored-overlay";
import { authoredMetadata, legacyRevisions, legacyExerciseReferences } from "./authored-data";

/** Historical registration remains available for preservation audits. */
export const legacyCatalog = catalogSchema.parse(catalogData);
export const catalog = catalogSchema.parse(applyAuthoredOverlay(legacyCatalog, authoredMetadata, legacyRevisions, legacyExerciseReferences));
export { authoredMetadata, legacyRevisions, legacyExerciseReferences } from "./authored-data";
export { applyAuthoredOverlay } from "./authored-overlay";
export * from "./catalog-schema";
export * from "./catalog-readiness";
