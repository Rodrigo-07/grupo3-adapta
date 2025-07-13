import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Course, Class } from '@/lib/types';
import axios from 'axios';

interface LmsState {
  courses: Course[];
  classes: Class[];
  getCourseById: (id: string) => Course | undefined;
  getClassesByCourse: (courseId: string) => Class[];
  fetchCourses: () => Promise<void>;
  fetchClasses: (courseId: string) => Promise<void>;
  addCourse: (course: Omit<Course, 'id'>) => Promise<Course | null>;
  addClass: (newClass: Omit<Class, 'id'>) => Promise<Class | null>;
}

const API_BASE = 'http://localhost:8000/courses';

export const useLmsStore = create<LmsState>()(
  persist(
    (set, get) => ({
      courses: [],
      classes: [],

      getCourseById: (id: string) => {
        return get().courses.find((course) => course.id === id);
      },

      getClassesByCourse: (courseId: string) => {
        return get().classes.filter((c) => c.courseId === courseId);
      },

      fetchCourses: async () => {
        try {
          const res = await axios.get(`${API_BASE}/courses`); // GET /courses/courses
          set({ courses: res.data.map((c: any) => ({ id: String(c.id), name: c.title, description: c.description })) });
        } catch (err) {
          console.error('Failed to fetch courses', err);
        }
      },
      fetchClasses: async (courseId: string) => {
        try {
          const res = await axios.get(`http://localhost:8000/courses/courses/${courseId}/lessons`); // GET /courses/courses/:id/lessons
          set((state) => ({
            classes: [
              ...state.classes.filter((c) => c.courseId !== courseId),
              ...res.data.map((cls: any) => ({ ...cls, courseId })),
            ],
          }));
        } catch (err) {
          console.error('Failed to fetch classes', err);
        }
      },
      addCourse: async (courseData: Omit<Course, 'id'>) => {
        try {
          const payload = { title: courseData.name, description: courseData.description };
          const res = await axios.post(`${API_BASE}/courses`, payload); // POST /courses/courses
          const newCourse = { id: String(res.data.id), name: res.data.title, description: res.data.description };
          set((state) => ({ courses: [...state.courses, newCourse] }));
          return newCourse;
        } catch (err) {
          console.error('Failed to add course', err);
          return null;
        }
      },
      addClass: async (classData: Omit<Class, 'id'>) => {
        try {
          const { courseId, name, description } = classData;
          const formData = new FormData();
          formData.append('title', name);
          formData.append('description', description);
          formData.append('video', new Blob(["dummy"], { type: 'video/mp4' }), 'dummy.mp4');
          const res = await axios.post(`http://localhost:8000/courses/courses/${courseId}/lessons`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          }); // POST /courses/courses/:id/lessons
          const newClass = { id: String(res.data.id), courseId: String(res.data.course_id), name: res.data.title, description: res.data.description };
          set((state) => ({ classes: [...state.classes, newClass] }));
          return newClass;
        } catch (err) {
          console.error('Failed to add class', err);
          return null;
        }
      },
    }),
    {
      name: 'course-craft-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
