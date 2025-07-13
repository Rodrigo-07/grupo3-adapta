export interface Course {
  id: string;
  name: string;
  description: string;
}

export interface Class {
  id: string;
  courseId: string;
  name: string;
  description: string;
}
