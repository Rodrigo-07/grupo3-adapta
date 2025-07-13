export interface Course {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
}

export interface Class {
  id: string;
  courseId: string;
  name: string;
  description: string;
  videoUrl?: string;
  resources?: string[];
}
