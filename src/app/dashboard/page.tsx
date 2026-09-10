import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreateDeckDialog } from "@/components/CreateDeckDialog";
import { DeckListCard } from "@/components/DeckListCard";
import { StartStudyDialog } from "@/components/StartStudyDialog";
import { getUserDecksWithCardCounts } from "@/db/queries/decks";

export default async function Dashboard() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  // Fetch user's decks with card counts
  const userDecks = await getUserDecksWithCardCounts(userId);
  const studyDecks = userDecks.map((deck) => ({
    id: deck.id,
    title: deck.title,
    description: deck.description,
    cardCount: deck.cardCount,
  }));

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
                    <Badge variant="outline">{userDecks.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Manage your flashcard collections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold mb-1">{userDecks.length}</div>
                      <p className="text-sm text-muted-foreground">
                        Total decks created
                      </p>
                    </div>
                    <CreateDeckDialog>
                      <Button className="w-full">
                        Create New Deck
                      </Button>
                    </CreateDeckDialog>
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
                    <StartStudyDialog decks={studyDecks}>
                      <Button variant="outline" className="w-full">
                        Start Studying
                      </Button>
                    </StartStudyDialog>
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
                    <StartStudyDialog decks={studyDecks}>
                      <Button variant="outline" className="w-full justify-start">
                        Study Session
                      </Button>
                    </StartStudyDialog>
                    <Button variant="outline" className="w-full justify-start">
                      View Statistics
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Deck List Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">My Decks</h2>
            
            {userDecks.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-muted-foreground mb-4">
                      <svg
                        className="w-12 h-12 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No decks yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Create your first flashcard deck to start learning and studying effectively.
                    </p>
                    <CreateDeckDialog>
                      <Button>Create Your First Deck</Button>
                    </CreateDeckDialog>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userDecks.map((deck) => (
                  <DeckListCard key={deck.id} deck={deck} />
                ))}
              </div>
            )}
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