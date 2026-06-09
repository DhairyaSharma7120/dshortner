import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { email, password } = body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("No user found with email:", email);
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const isValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const accessToken = generateAccessToken(
    user.id,
    user.email
  );

  return NextResponse.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
    },
  });
}