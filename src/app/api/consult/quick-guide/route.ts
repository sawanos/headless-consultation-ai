import { NextRequest, NextResponse } from "next/server";
import { getCategoryById } from "@/lib/categories";
import { QuickGuideRequestSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = QuickGuideRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cat = getCategoryById(parsed.data.category);
  if (!cat) {
    return NextResponse.json({ error: "unknown category" }, { status: 400 });
  }

  return NextResponse.json(cat.quickGuide);
}
