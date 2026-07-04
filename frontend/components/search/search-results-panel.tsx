"use client";

import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/feedback/empty-state";
import { VideoFeed } from "@/components/video/video-feed";

export function SearchResultsPanel() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return (
      <div className="grid min-h-[calc(100vh-140px)] place-items-center">
        <EmptyState
          eyebrow="Search"
          title="Search Streamly videos."
          description="Enter a query in the search bar to load backend video results."
        />
      </div>
    );
  }

  return (
    <VideoFeed
      description={`Backend results for "${query}".`}
      emptyDescription="No backend videos matched this search."
      emptyTitle="No results found."
      eyebrow="Search"
      filters={{ limit: 16, query }}
      title="Search results"
    />
  );
}
