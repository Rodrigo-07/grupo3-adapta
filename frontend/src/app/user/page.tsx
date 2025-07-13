"use client";

import { useState, useMemo, useEffect } from "react";
import { CourseCard } from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { useLmsStore } from "@/store/lmsStore";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const { courses, getClassesByCourse, fetchCourses } = useLmsStore();
  const hasMounted = useHasMounted();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    return courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  const uniqueFilteredCourses = useMemo(() => Array.from(new Map(filteredCourses.map(c => [c.id, c])).values()), [filteredCourses]);

  if (!hasMounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-headline mb-8">Explorar Cursos</h1>
        <div className="mb-8 relative">
           <Skeleton className="h-10 w-full" />
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Explorar Cursos</h1>
      <div className="mb-8 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por cursos..."
          className="pl-10 w-full md:w-1/2 lg:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {uniqueFilteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {uniqueFilteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              classCount={getClassesByCourse(course.id).length}
              href={`/user/${course.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Nenhum curso encontrado</h2>
          <p className="text-muted-foreground mt-2">Tente outro termo de busca ou volte mais tarde.</p>
        </div>
      )}
    </div>
  );
}
