"use client";

import { useLmsStore } from "@/store/lmsStore";
import { useParams, useRouter } from "next/navigation";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClassesList() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const getCourseById = useLmsStore((state) => state.getCourseById);
  const getClassesByCourse = useLmsStore((state) => state.getClassesByCourse);
  const course = getCourseById(courseId);
  const classes = getClassesByCourse(courseId);
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
         <Skeleton className="h-8 w-24 mb-4" />
         <Skeleton className="h-10 w-3/4 mb-2" />
         <Skeleton className="h-5 w-full mb-8" />
         <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
         </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <p className="text-muted-foreground mt-2">The course you are looking for does not exist.</p>
        <Button variant="link" asChild className="mt-4">
          <Link href="/creator">Go back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => router.push('/creator')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </Button>
      <Card className="mb-8 rounded-2xl shadow-md p-6">
        <CardHeader className="p-0">
          <CardTitle className="font-headline text-3xl">{course.name}</CardTitle>
          <CardDescription className="pt-2">{course.description}</CardDescription>
        </CardHeader>
      </Card>

      <h2 className="text-2xl font-bold font-headline mb-6">Classes</h2>

      <div className="space-y-4">
        {classes.length > 0 ? (
          classes.map((cls) => (
            <Card key={cls.id} className="rounded-xl">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{cls.name}</h3>
                  <p className="text-sm text-muted-foreground">{cls.description}</p>
                </div>
                {/* Future actions can go here e.g. Edit, Delete */}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No classes yet</h2>
            <p className="text-muted-foreground mt-2 mb-4">Add the first class to your course.</p>
          </div>
        )}
      </div>

      <Button asChild className="fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-lg">
        <Link href={`/creator/${courseId}/new-class`}>
          <Plus className="h-8 w-8" />
          <span className="sr-only">Add Class</span>
        </Link>
      </Button>
    </div>
  );
}
