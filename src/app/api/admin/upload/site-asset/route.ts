import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getAuthErrorResponse, requireAdmin } from "@/lib/auth";
import { buildSiteAssetPath, siteAssetBucket, validateSiteAssetImageFile } from "@/lib/site-asset-upload";
import { supabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const validation = validateSiteAssetImageFile(formData.get("file"));

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const file = validation.file;
    const filePath = buildSiteAssetPath(file.type);
    const { error: uploadError } = await supabase.storage.from(siteAssetBucket).upload(filePath, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false
    });

    if (uploadError) {
      throw new Error(`Supabase image upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(siteAssetBucket).getPublicUrl(filePath);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return errorResponse(error, 500, "Unable to upload image.");
  }
}
