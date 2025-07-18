"use client";

import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useLmsStore } from "@/store/lmsStore";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export default function CreatorDashboard() {
  const courses = useLmsStore((state) => state.courses);
  const getClassesByCourse = useLmsStore((state) => state.getClassesByCourse);
  const fetchCourses = useLmsStore((state) => state.fetchCourses);
  const hasMounted = useHasMounted();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (!hasMounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-headline">Meus Cursos</h1>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[225px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const uniqueCourses = Array.from(new Map(courses.map(c => [c.id, c])).values());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Meus Cursos</h1>
        <Button asChild>
          <Link href="/creator/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Curso
          </Link>
        </Button>
      </div>
      {uniqueCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {uniqueCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              classCount={getClassesByCourse(course.id).length}
              href={`/creator/${course.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">Nenhum curso ainda</h2>
            <p className="text-muted-foreground mt-2 mb-4">Clique em "Novo Curso" para começar.</p>
            <Button asChild>
                <Link href="/creator/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar seu Primeiro Curso
                </Link>
            </Button>
        </div>
      )}
    </div>
  );
}
