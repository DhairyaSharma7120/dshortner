import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ShortnerPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    let link;
    try {
        link = await prisma.link.update({
            where: { shortCode: slug },
            data: { clickCount: { increment: 1 } },
            select: { originalUrl: true },
        });
    } catch {
        notFound();
    }

    redirect(link!.originalUrl);
}