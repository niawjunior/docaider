import { getGalleryData } from "@/app/actions/resume";
import { GalleryPage } from "@/components/gallery/GalleryPage";

export const dynamic = "force-dynamic";

export default async function Gallery() {
  const data = await getGalleryData();

  return <GalleryPage initialData={data} />;
}
