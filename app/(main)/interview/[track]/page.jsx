import { DrillPage } from "@/components/interview/DrillPage";
import { tracks } from "@/lib/interview/tracks";

export const metadata = { title: "Interview Drill — SprintCode" };

export function generateStaticParams() {
    return tracks.map((t) => ({ track: t.id }));
}

export default async function TrackDrillPage({ params }) {
    const { track } = await params;
    return <DrillPage trackId={track} />;
}
