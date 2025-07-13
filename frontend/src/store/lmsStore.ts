import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Course, Class } from '@/lib/types';

interface LmsState {
  courses: Course[];
  classes: Class[];
  getCourseById: (id: string) => Course | undefined;
  getClassesByCourse: (courseId: string) => Class[];
  addCourse: (course: Omit<Course, 'id'>) => Course;
  addClass: (newClass: Omit<Class, 'id'>) => Class;
}

const MOCK_COURSES: Course[] = [
    { id: '1', name: 'Introduction to AI', description: 'Learn the fundamentals of Artificial Intelligence.', thumbnail: 'https://placehold.co/600x400.png' },
    { id: '2', name: 'Advanced React', description: 'Deep dive into React concepts.', thumbnail: 'https://placehold.co/600x400.png' },
];

const MOCK_CLASSES: Class[] = [
    { id: 'c1-1', courseId: '1', name: 'History of AI', description: 'A look back at the origins of AI.' },
    { id: 'c1-2', courseId: '1', name: 'Neural Networks 101', description: 'Understanding the building blocks.' },
    { id: 'c2-1', courseId: '2', name: 'React Hooks in Depth', description: 'Master useState, useEffect, and more.' },
];

export const useLmsStore = create<LmsState>()(
  persist(
    (set, get) => ({
      courses: MOCK_COURSES,
      classes: MOCK_CLASSES,

      getCourseById: (id: string) => {
        return get().courses.find((course) => course.id === id);
      },

      getClassesByCourse: (courseId: string) => {
        return get().classes.filter((c) => c.courseId === courseId);
      },

      addCourse: (courseData: Omit<Course, 'id'>) => {
        // TODO: replace with API call
        const newCourse: Course = {
          ...courseData,
          id: new Date().toISOString(),
        };
        set((state) => ({ courses: [...state.courses, newCourse] }));
        return newCourse;
      },

      addClass: (classData: Omit<Class, 'id'>) => {
        // TODO: replace with API call
        const newClass: Class = {
            ...classData,
            id: new Date().toISOString(),
        };
        set(state => ({ classes: [...state.classes, newClass] }));
        return newClass;
      },
    }),
    {
      name: 'course-craft-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
