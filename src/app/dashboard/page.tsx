import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Dashboard() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome to your FlashyCardy dashboard
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Decks</CardTitle>
              <CardDescription>
                Manage your flashcard collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">0</div>
              <p className="text-sm text-muted-foreground mb-4">
                Total decks
              </p>
              <Button className="w-full">
                Create New Deck
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Study Progress</CardTitle>
              <CardDescription>
                Track your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">0</div>
              <p className="text-sm text-muted-foreground mb-4">
                Cards studied today
              </p>
              <Button variant="outline" className="w-full">
                Start Studying
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                Browse All Decks
              </Button>
              <Button variant="outline" className="w-full">
                Study Session
              </Button>
              <Button variant="outline" className="w-full">
                View Statistics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}