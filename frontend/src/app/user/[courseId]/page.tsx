"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useLmsStore } from "@/store/lmsStore";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { VideoPlayerStub } from "@/components/VideoPlayerStub";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function CoursePlayer() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { getCourseById, getClassesByCourse } = useLmsStore();
  const hasMounted = useHasMounted();
  
  const course = getCourseById(courseId);
  const classes = getClassesByCourse(courseId);

  const [activeClassId, setActiveClassId] = useState(classes[0]?.id);
  const [progress, setProgress] = useState(33); // Mock progress
  const [activeTab, setActiveTab] = useState('video');

  if (!hasMounted) {
    return <CoursePlayerSkeleton />;
  }

  if (!course) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold">Course not found.</h1>
        </div>
    );
  }

  const activeClass = classes.find(c => c.id === activeClassId) || classes[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <h1 className="text-3xl font-bold font-headline mb-2">{course.name}</h1>
          <h2 className="text-xl text-muted-foreground font-semibold mb-4">{activeClass?.name}</h2>
          {/* Tabs above video */}
          <Tabs defaultValue="video" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="shorts">Shorts</TabsTrigger>
              <TabsTrigger value="thread">Thread</TabsTrigger>
              <TabsTrigger value="ebook">Ebook</TabsTrigger>
              <TabsTrigger value="podcast">Podcast</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Only show video in 'video' tab */}
          {activeTab === 'video' && <div className="mt-6"><VideoPlayerStub /></div>}
          <div className="my-6">
            <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">Your Progress</p>
                <p className="text-sm font-semibold">{progress}% Complete</p>
            </div>
            <Progress value={progress} />
          </div>

          {/* Tab content below progress bar */}
          <div className="mt-4">
            {activeTab === 'video' && (
              <p className="text-muted-foreground">{activeClass?.description}</p>
            )}
            {activeTab === 'shorts' && (
              <div className="flex justify-center">
                <Carousel className="w-full max-w-2xl">
                  <CarouselContent>
                    {[1,2,3].map((i) => (
                      <CarouselItem key={i} className="flex items-center justify-center">
                        <div className="aspect-video w-full bg-gray-300 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-2xl font-bold text-gray-500">
                          Short {i}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            )}
            {activeTab === 'thread' && (
              <div className="flex flex-col items-center w-full">
                <div className="w-full max-w-2xl">
                  {/* Main thread intro */}
                  <Card className="rounded-xl mb-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 p-6 pb-2">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src="https://i.pravatar.cc/150?img=10" alt="Jane Doe" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold leading-tight text-lg">Jane Doe <span className="text-yellow-400">◆</span></div>
                        <div className="text-xs text-muted-foreground">@janedoe · 2h</div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 text-base">
                      <span className="font-medium">Thread:</span> How to master React for modern web development. Aqui estão minhas principais dicas e aprendizados!
                    </CardContent>
                    <div className="px-6 pb-4 text-xs text-muted-foreground flex items-center gap-2">
                      1:00 PM · 12 de jul de 2025 · <span className="font-semibold">32,9 mil</span> Visualizações
                    </div>
                    <div className="px-6 pb-4 flex gap-8 text-muted-foreground">
                      <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 8</div>
                      <div className="flex items-center gap-1"><Repeat2 className="w-4 h-4" /> 11</div>
                      <div className="flex items-center gap-1"><Heart className="w-4 h-4" /> 418</div>
                      <div className="flex items-center gap-1"><Share2 className="w-4 h-4" /> 537</div>
                    </div>
                  </Card>
                  <Separator className="my-2" />
                  {/* Threaded tweets */}
                  <div className="relative">
                    {/* Vertical line for thread linking */}
                    <div className="absolute left-7 top-0 bottom-0 w-px bg-muted-foreground/20 z-0" style={{marginLeft: '0.75rem'}} />
                    <div className="space-y-0 relative z-10">
                      {[
                        {
                          text: 'Monitorar imóveis. Tenho planos de mudar para alugar uma casa, mas as melhores oportunidades nas imobiliárias alugam rápido. Fiz uma automação que monitora os sites das principais imobiliárias da cidade e me avisa no telegram se aparece algum imóvel novo dentro dos meus filtros.',
                          replies: 1, retweets: 21, likes: 2000, shares: 1
                        },
                        {
                          text: 'Dividir as contas da casa. Divido as contas da casa com minha namorada. Usamos Splitwise pra isso. Criei um Agente de IA que processa nossos gastos, quem pagou, quantas parcelas foram, classifica a categoria automaticamente e calcula os gastos no final do mês pra gente se pagar.',
                          replies: 1, retweets: 19, likes: 2000, shares: 1
                        },
                        {
                          text: 'Análise de CV com IA. Criei um agente que puxa candidatos do nosso processo seletivo na empresa e ajuda a resumir o Currículo que o candidato enviou por PDF, classificando e dando uma nota de acordo com meus critérios e avançando os candidatos para próximas fases automaticamente.',
                          replies: 1, retweets: 9, likes: 2000, shares: 1
                        },
                        {
                          text: 'Monitoração de Empresas. Eu monitoro alguns sites e plataformas de empresas e concorrentes de um jeito muito específico, mas que me ajuda a ser um dos primeiros a saber sobre mudanças e lançamentos dessas empresas. Usando técnicas de white hacking e segurança.',
                          replies: 1, retweets: 11, likes: 2000, shares: 1
                        }
                      ].map((tweet, i, arr) => (
                        <div key={i} className="relative flex">
                          {/* Avatar aligned with line */}
                          <div className="flex flex-col items-center mr-4">
                            <Avatar className="h-12 w-12 z-10">
                              <AvatarImage src="https://i.pravatar.cc/150?img=10" alt="Jane Doe" />
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1">
                            <Card className="rounded-xl mb-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
                              <CardHeader className="flex flex-row items-center gap-2 p-4 pb-2">
                                <div>
                                  <div className="font-semibold leading-tight text-base">Jane Doe <span className="text-yellow-400">◆</span></div>
                                  <div className="text-xs text-muted-foreground">@janedoe · 9h</div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-0 text-base">
                                {tweet.text}
                              </CardContent>
                              <div className="px-4 pb-3 flex gap-8 text-muted-foreground text-sm">
                                <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {tweet.replies}</div>
                                <div className="flex items-center gap-1"><Repeat2 className="w-4 h-4" /> {tweet.retweets}</div>
                                <div className="flex items-center gap-1"><Heart className="w-4 h-4" /> {tweet.likes.toLocaleString('pt-BR')}</div>
                                <div className="flex items-center gap-1"><Share2 className="w-4 h-4" /> {tweet.shares}</div>
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
            {['ebook', 'podcast', 'quiz'].includes(activeTab) && (
              <Card className="flex items-center justify-center p-10 rounded-2xl">
                <p className="text-muted-foreground">Content for {activeTab} is coming soon!</p>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar with class list */}
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
                    setActiveClassId(cls.id)
                    setProgress(Math.round(((index + 1)/classes.length) * 100))
                  }}
                >
                  <CheckCircle2 className={`mr-3 h-5 w-5 ${index*33 < progress ? 'text-primary' : 'text-muted-foreground/50'}`} />
                  <span className="text-left leading-tight">{cls.name}</span>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CoursePlayerSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2 order-2 lg:order-1">
                    <Skeleton className="h-10 w-3/4 mb-2" />
                    <Skeleton className="h-8 w-1/2 mb-4" />
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <div className="my-6">
                        <Skeleton className="h-5 w-24 mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex gap-2 mb-4">
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-20" />
                    </div>
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="lg:col-span-1 order-1 lg:order-2 mb-8 lg:mb-0">
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
    )
}
