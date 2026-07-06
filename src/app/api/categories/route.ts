import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { id, readData, slugify, writeData } from "@/lib/db";
import type { Category } from "@/lib/types";

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data.categories);
  } catch (error) {
    return errorResponse(error, 500, "Unable to load categories.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.description) {
      return NextResponse.json({ error: "Category name and description are required." }, { status: 400 });
    }
    const data = await readData();
    const category: Category = {
      id: id("cat"),
      name: String(body.name),
      slug: slugify(String(body.name)),
      description: String(body.description)
    };
    data.categories.push(category);
    await writeData(data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return errorResponse(error, 500, "Unable to create category.");
  }
}
