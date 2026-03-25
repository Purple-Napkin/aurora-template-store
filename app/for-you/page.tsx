import { Suspense } from "react";
import { ForYouClientContent } from "@/components/ForYouClientContent";
import { ForYouSections } from "@/components/ForYouSections";
import { StoreContentRails } from "@/components/StoreContentRails";
import {
  ForYouHeaderRailsSkeleton,
  ForYouSectionsSkeleton,
} from "@/components/ForYouStreamingSkeletons";

export const dynamic = "force-dynamic";

/**
 * For You – bundles and suggestions. Suspense streams header rails vs main sections; `loading.tsx` covers navigation.
 */
export default function ForYouPage() {
  return (
    <ForYouClientContent
      belowTitle={
        <Suspense fallback={<ForYouHeaderRailsSkeleton />}>
          <StoreContentRails
            contentPage="for_you"
            contentRegion="for_you_below_header"
            className="mt-4"
          />
        </Suspense>
      }
      sections={
        <Suspense fallback={<ForYouSectionsSkeleton />}>
          <ForYouSections />
        </Suspense>
      }
    />
  );
}
