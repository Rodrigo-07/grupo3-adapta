import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12 flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="Logo Camufy"
          width={80}
          height={80}
          className="mb-4"
        />
        <h1 className="text-5xl font-bold font-headline tracking-tighter mb-4">
          Bem-vindo ao Camufy
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          O futuro do aprendizado, impulsionado por IA. Crie cursos envolventes
          ou comece sua jornada de estudos agora mesmo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/creator">
          <Card className="h-full hover:border-primary transition-colors duration-300 group hover:bg-[#caebe7]">
            <CardHeader className="flex flex-row items-center gap-4">
              <GraduationCap className="w-8 h-8 text-primary text-[#abece4]" />
              <CardTitle className="font-headline text-2xl">
                Para Criadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Construa e gerencie seus cursos com ferramentas intuitivas e
                aprimoradas por IA.
              </p>
              <Button variant="outline" className='hover:border-none'>Ir para o Painel do Criador</Button>
            </CardContent>
          </Card>
        </Link>
        <Link href="/user">
          <Card className="h-full hover:border-primary transition-colors duration-300 group hover:bg-[#caebe7]">
            <CardHeader className="flex flex-row items-center gap-4">
              <User className="w-8 h-8 text-primary text-[#abece4]" />
              <CardTitle className="font-headline text-2xl">
                Para Alunos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Explore um universo de conhecimento. Encontre seu próximo curso e
                comece a aprender.
              </p>
              <Button variant="outline" className='hover:border-none'>Ir para o Painel do Aluno</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
