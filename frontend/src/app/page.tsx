import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, User } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold font-headline tracking-tighter mb-4">
          Welcome to Camufy
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The future of learning, powered by AI. Create engaging courses or
          start your learning journey today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/creator">
          <Card className="h-full hover:border-primary transition-colors duration-300 group">
            <CardHeader className="flex flex-row items-center gap-4">
              <GraduationCap className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline text-2xl">
                For Creators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Build and manage your courses with our intuitive, AI-enhanced
                tools.
              </p>
              <Button variant="outline">
                Go to Creator Dashboard
              </Button>
            </CardContent>
          </Card>
        </Link>
        <Link href="/user">
          <Card className="h-full hover:border-primary transition-colors duration-300 group">
            <CardHeader className="flex flex-row items-center gap-4">
              <User className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline text-2xl">For Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Explore a universe of knowledge. Find your next course and start
                learning.
              </p>
              <Button variant="outline">
                Go to User Dashboard
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
