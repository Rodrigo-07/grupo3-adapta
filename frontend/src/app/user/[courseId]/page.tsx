"use client";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useLmsStore } from "@/store/lmsStore";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Repeat2, Heart, Share2 } from "lucide-react";
import Chatbot from "@/components/ui/chatbot";

// ✅ Shared video/shorts wrapper
function VideoArea({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-neutral-100 mt-6">
      {children}
    </div>
  );
}

export default function CoursePlayer() {
  const params = useParams();
  const courseId = params.courseId as string;
  const getCourseById = useLmsStore((state) => state.getCourseById);
  const classes = useLmsStore((state) => state.getClassesByCourse(courseId));
  const fetchClasses = useLmsStore((state) => state.fetchClasses);
  const hasMounted = useHasMounted();

  const [activeClassId, setActiveClassId] = useState(classes[0]?.id);
  const [progress, setProgress] = useState(33);
  const [activeTab, setActiveTab] = useState("video");
  const [shorts, setShorts] = useState<string[]>([]);
  const [threadsMensages, setThreadsMessages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const handleSlideChange = React.useCallback((index: number) => {
    setActiveIndex(index);
  }, []);


  useEffect(() => {
    fetchClasses(courseId);
  }, [fetchClasses, courseId]);

  const course = getCourseById(courseId);
  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0];

  const getVideoUrl = (videoPath?: string) => {
    if (!videoPath) return "";
    const relPath = videoPath.startsWith("/app/uploads/")
      ? videoPath.slice("/app/uploads/".length)
      : videoPath;
    return `http://localhost:8000/contents/media/${relPath}`;
  };

  useEffect(() => {
    if (!courseId || !activeClass?.id || activeTab !== "shorts") return;

    const fetchShorts = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/contents/files?course_id=${courseId}&lesson_id=${activeClass.id}&category=shorts`
        );
        const data = await res.json();
        const urls = data.map((file: any) => {
          const relPath = file.path.startsWith("/app/uploads/")
            ? file.path.slice("/app/uploads/".length)
            : file.path;
          return `http://localhost:8000/contents/media/${relPath}`;
        });
        setShorts(urls);
      } catch (err) {
        console.error("Failed to fetch shorts:", err);
        setShorts([]);
      }
    };

    fetchShorts();
  }, [courseId, activeClass?.id, activeTab]);

  useEffect(() => {
    if (!courseId || !activeClass?.id || activeTab !== "thread") return;

    const fetchThreads = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/courses/courses/${courseId}/lessons/${activeClass.id}?with_files=false`
        );
        const data = await res.json();
        const threadMessages = data.thread?.messages || [];
        const cleanMsgs = threadMessages.map((m: { tweet: string }) =>
          m.tweet.slice(3).trim()
        );
        setThreadsMessages(cleanMsgs);
      } catch (err) {
        console.error("Failed to fetch threads:", err);
        setThreadsMessages([]);
      }
    };

    fetchThreads();
  }, [courseId, activeClass?.id, activeTab]);

  if (!hasMounted) return <div className="fixed inset-0 bg-white z-50"><CoursePlayerSkeleton /></div>;
  if (!course) return <div className="p-8 text-center">Course not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <h1 className="text-3xl font-bold mb-2">{course.name}</h1>

          {/* ✅ Title and Tabs side by side */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 flex-wrap">
            <h2 className="text-xl text-muted-foreground font-semibold">
              {activeClass?.name}
            </h2>
            <Tabs defaultValue="video" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex flex-wrap justify-center mb-4 sm:justify-start">
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="shorts">Shorts</TabsTrigger>
                <TabsTrigger value="thread">Thread</TabsTrigger>
                <TabsTrigger value="progress">Podcast</TabsTrigger>
                <TabsTrigger value="progress">Ebook</TabsTrigger>
                
              </TabsList>
            </Tabs>
          </div>
          {/* PROGRESS */}
          <div className="my-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Your Progress</p>
              <p className="text-sm font-semibold">{progress}% Complete</p>
            </div>
            <Progress className="bg-gray-300" value={progress} />
          </div>
          
          {/* VIDEO */}
          {activeTab === "video" && (
            <VideoArea>
              {activeClass?.video ? (
                <video
                  src={getVideoUrl(activeClass.video)}
                  controls
                  className="absolute top-0 left-0 w-full h-full object-cover z-0"
                />
              ) : (
                <div className="absolute top-0 left-0 w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 z-0">
                  No video available for this class.
                </div>
              )}
            </VideoArea>
          )}

          {/* SHORTS */}
          {activeTab === "shorts" && (
            <div className="group relative w-full aspect-video rounded-lg overflow-hidden bg-neutral-100 mt-6">
              <Carousel
                className="w-full h-full relative z-10"
                onSlideChange={handleSlideChange}
              >
                <CarouselContent className="z-0">
                  {shorts.length > 0 ? (
                    shorts.map((url, i) => (
                      <CarouselItem key={i} className="flex justify-center items-center">
                        <div className="relative w-full h-full z-0">
                          <video
                            ref={(el) => {
                              if (el) videoRefs.current[i] = el;
                            }}
                            src={url}
                            controls
                            className="w-full h-full object-contain z-0"
                          />
                        </div>
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem>
                      <div className="w-full h-full flex items-center justify-center text-gray-500 z-0">
                        No shorts found.
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>

                <CarouselPrevious className="hidden group-hover:flex absolute top-1/2 left-4 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full shadow-lg transition" />
                <CarouselNext className="hidden group-hover:flex absolute top-1/2 right-4 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full shadow-lg transition" />
              </Carousel>
            </div>
          )}






          {/* THREADS */}
          {activeTab === "thread" && (
            <div className="flex flex-col items-center w-full">
              <div className="w-full max-w-2xl">
                {/* ... thread content remains unchanged ... */}
              </div>
            </div>
          )}

          
          {activeTab === "thread" && (
            <div className="flex flex-col items-center w-full">
              <div className="w-full max-w-2xl">
              {/* Main thread intro */}
              <Card className="rounded-xl mb-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-4 p-6 pb-2">
                <Avatar className="h-14 w-14">
                  <AvatarImage src="/ze.jpg" alt="Zé" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold leading-tight text-lg">
                  Zé <span className="text-yellow-400">◆</span>
                  </div>
                  <div className="text-xs text-muted-foreground">@zealencar · 2h</div>
                </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 text-base">
                <span className="font-medium">Thread:</span> Vamos falar sobre {activeClass?.name}?
                </CardContent>
                <div className="px-6 pb-4 text-xs text-muted-foreground flex items-center gap-2">
                1:00 PM · 12 de jul de 2025 · <span className="font-semibold">32,9 mil</span> Visualizações
                </div>
                <div className="px-6 pb-4 flex gap-8 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" /> 8
                </div>
                <div className="flex items-center gap-1">
                  <Repeat2 className="w-4 h-4" /> 11
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" /> 418
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" /> 537
                </div>
                </div>
              </Card>
              <Separator className="my-2" />
              {/* Threaded tweets */}
              <div className="relative">
                {/* Vertical line for thread linking */}
                <div
                className="absolute left-7 top-0 bottom-0 w-px bg-muted-foreground/20 z-0"
                style={{ marginLeft: "0.75rem" }}
                />
                <div className="space-y-0 relative z-10">
                {threadsMensages.map((message, i) => (
                  <div key={i} className="relative flex">
                  {/* Avatar aligned with line */}
                  <div className="flex flex-col items-center mr-4">
                    <Avatar className="h-12 w-12 z-10">
                    <AvatarImage src="/ze.jpg" alt="Zé" />
                    <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <Card className="rounded-xl mb-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-2 p-4 pb-2">
                      <div>
                      <div className="font-semibold leading-tight text-base">
                        Zé <span className="text-yellow-400">◆</span>
                      </div>
                      <div className="text-xs text-muted-foreground">@zealencar · 1h</div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-base">{message}</CardContent>
                    <div className="px-4 pb-3 flex gap-8 text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" /> 1
                      </div>
                      <div className="flex items-center gap-1">
                      <Repeat2 className="w-4 h-4" /> 5
                      </div>
                      <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" /> 200
                      </div>
                      <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" /> 3
                      </div>
                    </div>
                    </Card>
                  </div>
                  </div>
                ))}
                </div>
              </div>
              </div>
            </div>
            )}

          {activeTab === "video" && (
            <p className="text-muted-foreground">{activeClass?.description}</p>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1 order-1 lg:order-2 mb-8 lg:mb-0">
          <Card className="rounded-2xl p-4 sticky top-20">
            <h3 className="font-bold text-lg mb-4 px-2">Course Classes</h3>
            <div className="space-y-2">
              {classes.map((cls, index) => (
                <Button
                  key={cls.id}
                  variant={activeClassId === cls.id ? "secondary" : "ghost"}
                  className="w-full justify-start h-auto py-3"
                  onClick={() => {
                    setActiveClassId(cls.id);
                    setProgress(
                      Math.round(((index + 1) / classes.length) * 100)
                    );
                  }}
                >
                  <CheckCircle2
                    className={`mr-3 h-5 w-5 ${
                      index * 33 < progress
                        ? "text-primary"
                        : "text-muted-foreground/50"
                    }`}
                  />
                  <span className="text-left leading-tight">{cls.name}</span>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Chatbot Widget */}
      <Chatbot />
    </div>
  );
}

function CoursePlayerSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 mt-[-4rem]" style={{ marginTop: '-64px' }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="aspect-video w-full rounded-lg" />
          <div className="my-6">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <div className="lg:col-span-1 order-1 lg:order-2 mb-8 lg:mb-0">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}
