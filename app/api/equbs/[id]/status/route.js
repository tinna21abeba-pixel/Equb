import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";
import { findEqub } from "@/lib/queries";
import { statusOf } from "@/lib/equb";

export async function GET(_request, { params }) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const equb = await findEqub(user.id, id);
  if (!equb) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(statusOf(equb));
}
