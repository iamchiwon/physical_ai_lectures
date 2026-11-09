import { catalogData } from "./catalog-data";
import { catalogSchema } from "./catalog-schema";
import { applyAuthoredOverlay } from "./authored-overlay";
import { authoredMetadata, legacyRevisions, legacyExerciseReferences } from "./authored-data";
import { currentDefinitionCatalog } from "./current-definition";

/** Historical registration remains available for preservation audits. */
export const legacyCatalog = catalogSchema.parse(catalogData);
export const catalog = catalogSchema.parse(applyAuthoredOverlay(currentDefinitionCatalog, authoredMetadata, legacyRevisions, legacyExerciseReferences));
export { currentDefinitionCatalog, applyCurrentDefinition, learningStages, learningSequence, conditionalPrerequisites } from "./current-definition";
export type { LearningStage, ConditionalPrerequisite } from "./current-definition";
export { authoredMetadata, legacyRevisions, legacyExerciseReferences } from "./authored-data";
export type { AuthoredMetadata } from "./authored-overlay";
export { applyAuthoredOverlay } from "./authored-overlay";
export * from "./catalog-schema";
export * from "./catalog-readiness";
