import { catalog, curriculumIndex } from "@/lib/curriculum";
import { studyTutorCorpus } from "@/lib/study-tutor";
export const dynamic = "force-static";
export function generateStaticParams() { return catalog.units.map(({ id }) => ({ unitId: id })); }
export async function GET(_request: Request, { params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const unit = curriculumIndex.units.get(unitId);
  return unit ? Response.json(studyTutorCorpus(unit)) : new Response(null, { status: 404 });
}
