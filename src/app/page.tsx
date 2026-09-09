import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if user is logged in and redirect to dashboard
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }
  return (
    <div className="flex flex-col items-center justify-center bg-background min-h-screen">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-foreground">
          FlashyCardy
        </h1>
        <p className="text-xl text-muted-foreground">
          Your personal flashcard platform
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <SignInButton mode="modal">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="lg">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
