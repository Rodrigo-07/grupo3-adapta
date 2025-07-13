"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { useLmsStore } from "@/store/lmsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadPlaceholder } from "@/components/UploadPlaceholder";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(3, { message: "Class name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
});

export default function NewClassForm() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const addClass = useLmsStore((state) => state.addClass);
  const getCourseById = useLmsStore((state) => state.getCourseById);
  const fetchClasses = useLmsStore((state) => state.fetchClasses);
  const course = getCourseById(courseId);
  const { toast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!videoFile) {
      toast({
        title: "Video Required",
        description: "Please upload a class video.",
        variant: "destructive",
      });
      return;
    }
    const formData = new FormData();
    formData.append('title', values.name);
    formData.append('description', values.description);
    formData.append('video', videoFile);
    attachments.forEach(file => formData.append('attachments', file));
    const newClass = await addClass(formData, courseId);
    toast({
      title: newClass ? "Class Added!" : "Error",
      description: newClass ? `"${values.name}" has been added to the course.` : "Failed to add class. Please try again.",
      variant: newClass ? undefined : "destructive",
    });
    await fetchClasses(courseId);
    router.push(`/creator/${courseId}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Class List
      </Button>
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Add a New Class</CardTitle>
          <CardDescription>
            For course: <span className="font-semibold text-primary">{course?.name || '...'}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Understanding Black Holes" {...field} />
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
                    <FormLabel>Class Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief summary of this class..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="video"
                render={() => (
                  <FormItem>
                    <FormLabel>Class Video</FormLabel>
                    <FormControl>
                      <Input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="attachments"
                render={() => (
                  <FormItem>
                    <FormLabel>Attachments</FormLabel>
                    <FormControl>
                      <Input type="file" multiple onChange={e => setAttachments(Array.from(e.target.files || []))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Add Class</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
