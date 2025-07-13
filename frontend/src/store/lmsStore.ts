import { create } from 'zustand';
import type { Course, Class } from '@/lib/types';
import axios from 'axios';

interface LmsState {
  courses: Course[];
  classes: Class[];
  getCourseById: (id: string) => Course | undefined;
  getClassesByCourse: (courseId: string) => Class[];
  fetchCourses: () => Promise<void>;
  fetchClasses: (courseId: string) => Promise<void>;
  addCourse: (formData: FormData) => Promise<Course | null>;
  addClass: (formData: FormData, courseId: string) => Promise<Class | null>;
}

const API_BASE = 'http://localhost:8000/courses';

export const useLmsStore = create<LmsState>()((set, get) => ({
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
      set({ courses: res.data.map((c: any) => ({ id: String(c.id), name: c.title, description: c.description, coverImage: c.cover_image_path })) });
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  },
  fetchClasses: async (courseId: string) => {
    try {
      console.log("Fetching classes for courseId:", courseId, typeof courseId);
      const res = await axios.get(`http://localhost:8000/courses/courses/${courseId}/lessons`); // GET /courses/courses/:id/lessons
      set((state) => {
        const newClasses = [
          ...state.classes.filter((c) => c.courseId !== courseId),
          ...res.data.map((cls: any) => ({
            id: String(cls.id),
            courseId: String(cls.course_id),
            name: cls.title, // map backend 'title' to frontend 'name'
            description: cls.description,
            video: cls.video, // <-- add this line
            // add other fields as needed
          })),
        ];
        console.log('[lmsStore] Setting classes:', newClasses);
        return { classes: newClasses };
      });
    } catch (err) {
      console.error('Failed to fetch classes', err);
    }
  },
  addCourse: async (formData: FormData) => {
    try {
      const res = await axios.post(`${API_BASE}/courses`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newCourse = { id: String(res.data.id), name: res.data.title, description: res.data.description, coverImage: res.data.cover_image_path };
      set((state) => ({ courses: [...state.courses, newCourse] }));
      return newCourse;
    } catch (err) {
      console.error('Failed to add course', err);
      return null;
    }
  },
  addClass: async (formData: FormData, courseId: string) => {
    try {
      const res = await axios.post(`http://localhost:8000/courses/courses/${courseId}/lessons`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newClass = { id: String(res.data.id), courseId: String(res.data.course_id), name: res.data.title, description: res.data.description };
      set((state) => ({ classes: [...state.classes, newClass] }));
      return newClass;
    } catch (err) {
      console.error('Failed to add class', err);
      return null;
    }
  },
}));
