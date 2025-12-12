"use server";

import { headers } from "next/headers";
import { getBrowser } from "@/lib/pdf-helper";

export async function generateResumePDF(resumeId: string) {
  try {
    const headersList = await headers();
    
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      const host = headersList.get("host") || "localhost:3000";
      const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
      baseUrl = `${protocol}://${host}`;
    }
    baseUrl = baseUrl.replace(/\/$/, "");

    // Secret for Bypass
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const printUrl = `${baseUrl}/print/${resumeId}?secret=${secret}`;

    // Get Browser Instance (Local or Sparticuz)
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    // Set Viewport to A4
    await page.setViewport({ width: 794, height: 1123 });
    
    console.log(`Navigating to ${printUrl}...`);
    await page.goto(printUrl, { waitUntil: "networkidle0", timeout: 60000 });

    const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });

    await browser.close();
    
    const base64 = Buffer.from(pdf).toString('base64');
    return { success: true, pdfBase64: base64 };

  } catch (error: any) {
    console.error("PDF Generation Error details:", error);
    return { success: false, error: error.message || "Failed to generate PDF" };
  }
}
