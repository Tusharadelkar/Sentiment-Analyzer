import { NextRequest, NextResponse } from "next/server";
import { analyzeConversation } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const provider = (formData.get("provider") as any) || "gemini";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".txt")) {
      return NextResponse.json({ error: "Only .txt files are supported" }, { status: 400 });
    }

    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 500KB." }, { status: 400 });
    }

    const text = await file.text();

    if (text.trim().length < 20) {
      return NextResponse.json({ error: "File content too short for analysis" }, { status: 400 });
    }

    const result = await analyzeConversation(text, provider);

    return NextResponse.json({ success: true, data: result, filename: file.name, provider });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze conversation. Please try again." },
      { status: 500 }
    );
  }
}
