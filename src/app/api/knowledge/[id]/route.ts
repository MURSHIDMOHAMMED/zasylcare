import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { deleteDemoKnowledge, updateDemoKnowledge } from "@/services/knowledge.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createSupabaseServiceClient();

  const updatePayload: Record<string, unknown> = {};
  if (body.title !== undefined) updatePayload.title = body.title;
  if (body.category !== undefined) updatePayload.category = body.category;
  if (body.content !== undefined) updatePayload.content = body.content;
  if (body.enabled !== undefined) updatePayload.enabled = body.enabled;
  updatePayload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("company_knowledge")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const item = await updateDemoKnowledge(id, {
      title: body.title,
      category: body.category,
      content: body.content,
      enabled: body.enabled
    });
    if (item) {
      return NextResponse.json({ knowledge: item });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ knowledge: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase.from("company_knowledge").delete().eq("id", id);

  if (error) {
    const deleted = await deleteDemoKnowledge(id);
    if (deleted) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
