"use client";

import { useState, useEffect } from "react";
import { getLandingPageData } from "@/app/actions/resume";
import { LandingPage } from "@/components/resume/LandingPage";

export default function ResumeBuilderPage() {
  const [landingData, setLandingData] = useState<{ count: number; showcase: any[] }>({ count: 0, showcase: [] });

  useEffect(() => {
    getLandingPageData().then(setLandingData);
  }, []);

  return <LandingPage initialData={landingData} />;
}
