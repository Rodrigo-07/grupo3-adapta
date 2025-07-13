import type { Course } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { BookCopy } from 'lucide-react';
import Link from 'next/link';

interface CourseCardProps {
  course: Course;
  classCount: number;
  href: string;
}

export function CourseCard({ course, classCount, href }: CourseCardProps) {
  return (
    <Link href={href}>
      <Card className="h-full rounded-2xl shadow-md p-0 transition-transform hover:scale-[1.02] hover:shadow-lg">
        <CardHeader className="p-0">
          <Image
            src={course.thumbnail || 'https://placehold.co/600x400.png'}
            alt={course.name}
            width={600}
            height={400}
            className="rounded-t-2xl object-cover aspect-video"
            data-ai-hint="online course"
          />
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="font-headline text-xl mb-2">{course.name}</CardTitle>
          <CardDescription>{course.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <div className="flex items-center text-sm text-muted-foreground">
            <BookCopy className="w-4 h-4 mr-2" />
            <span>{classCount} {classCount === 1 ? 'class' : 'classes'}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
