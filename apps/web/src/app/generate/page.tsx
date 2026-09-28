import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import GenerateForm from "@/components/GenerateForm";

export default async function GeneratePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <GenerateForm />;
}
