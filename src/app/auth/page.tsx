import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, creatorProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";


export default async function AuthRedirectPage() {

  const { userId } = await auth();


  if (!userId) {
    redirect("/sign-in");
  }


  const localUser = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, userId))
    .limit(1);


  if (!localUser[0]) {
    redirect("/admin/onboarding");
  }


  const profile = await db
    .select()
    .from(creatorProfiles)
    .where(eq(
      creatorProfiles.userId,
      localUser[0].id
    ))
    .limit(1);


  if (!profile[0]) {
    redirect("/admin/onboarding");
  }


  redirect("/admin");
}