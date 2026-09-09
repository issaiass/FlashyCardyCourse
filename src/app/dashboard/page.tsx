import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default async function Dashboard() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome to your FlashyCardy dashboard
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              Free Plan
            </Badge>
          </div>
        </header>
        
        <main>
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    My Decks
                    <Badge variant="outline">0</Badge>
                  </CardTitle>
                  <CardDescription>
                    Manage your flashcard collections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold mb-1">0</div>
                      <p className="text-sm text-muted-foreground">
                        Total decks created
                      </p>
                    </div>
                    <Button className="w-full">
                      Create New Deck
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Study Progress
                    <Badge variant="outline">0%</Badge>
                  </CardTitle>
                  <CardDescription>
                    Track your learning journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold mb-1">0</div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Cards studied today
                      </p>
                      <Progress value={0} className="h-2" />
                    </div>
                    <Button variant="outline" className="w-full">
                      Start Studying
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Browse All Decks
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Study Session
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      View Statistics
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No recent activity yet. Create your first deck to get started!
                  </p>
                  <Button>
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}