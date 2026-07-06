import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { buildProductImagePath, productImageBucket, validateProductImageFile } from "@/lib/product-image-upload";
import { supabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const validation = validateProductImageFile(formData.get("file"));

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const file = validation.file;
    const filePath = buildProductImagePath(file.type);
    const { error: uploadError } = await supabase.storage.from(productImageBucket).upload(filePath, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false
    });

    if (uploadError) {
      throw new Error(`Supabase image upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(productImageBucket).getPublicUrl(filePath);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    return errorResponse(error, 500, "Unable to upload image.");
  }
}
