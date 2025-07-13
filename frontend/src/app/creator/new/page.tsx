"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useLmsStore } from "@/store/lmsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadPlaceholder } from "@/components/UploadPlaceholder";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(3, { message: "Course name must be at least 3 characters long." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }),
});

export default function NewCourseForm() {
  const router = useRouter();
  const addCourse = useLmsStore((state) => state.addCourse);
  const { toast } = useToast();
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!coverImage) {
      toast({
        title: "Cover Image Required",
        description: "Please upload a cover image for your course.",
        variant: "destructive",
      });
      return;
    }
    const formData = new FormData();
    formData.append('title', values.name);
    formData.append('description', values.description);
    formData.append('cover_image', coverImage);
    const newCourse = await addCourse(formData);
    if (newCourse && newCourse.id) {
      toast({
        title: "Course Created!",
        description: `"${values.name}" has been successfully created.`,
      });
      router.push(`/creator/${newCourse.id}`);
    } else {
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Create a New Course</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Introduction to Quantum Physics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what students will learn in this course..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cover_image"
                render={() => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" onChange={e => setCoverImage(e.target.files?.[0] || null)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <FormLabel>Resources</FormLabel>
                <div className="flex flex-wrap gap-4">
                    <UploadPlaceholder label="Add PDF" />
                    <UploadPlaceholder label="Add URL" />
                </div>
              </div>
              <Button type="submit">Create Course</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
