import { catalog, topicIndex } from "@/lib/curriculum";
import { studyTutorResourceIds } from "@/lib/study-tutor";
export const dynamic = "force-static";
export function GET() {
  return Response.json({ version: 1, units: catalog.units.map(unit => ({ unitId: unit.id, moduleId: topicIndex.get(unit.topicId)!.moduleId, resourceIds: studyTutorResourceIds(unit), url: `/tutor-study/${unit.id}` })) });
}
