export interface Course {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
}

export interface Class {
  id: string;
  courseId: string;
  name: string;
  description: string;
  video?: string;
}
