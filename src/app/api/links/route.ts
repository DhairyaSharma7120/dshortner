import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateShortCode } from "@/lib/shortner";
import { createLinkSchema } from "@/lib/validations/links";
import { verifyAccessToken } from "@/lib/jwt";
import type { JwtPayload } from "jsonwebtoken";

function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const payload = verifyAccessToken(auth.slice(7)) as JwtPayload;
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { originalUrl, customAlias } = parsed.data;

    const shortCode = customAlias || generateShortCode();

    const existing = await prisma.link.findFirst({
      where: {
        OR: [
          { shortCode },
          { customAlias: customAlias || undefined },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Alias already exists" },
        { status: 409 }
      );
    }

    const link = await prisma.link.create({
      data: {
        originalUrl,
        shortCode,
        userId,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const shortCode = searchParams.get("shortCode");

    // Return single link by shortCode
    if (shortCode) {
      const link = await prisma.link.findUnique({
        where: { shortCode },
      });
      if (!link) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
      }
      return NextResponse.json(link);
    }

    // Return all links for the user
    const links = await prisma.link.findMany({
      where: { userId },
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        clickCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(links);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}