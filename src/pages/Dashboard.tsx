import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Zap,
  Target,
  Award,
  Clock,
  TrendingUp,
  LogOut,
  Play,
  BookOpen,
  Trophy,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    xp_total: 0,
    elo: 1000,
    streak_days: 0,
    energy: 100,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
        // loadUserStats será habilitado após regeneração dos tipos
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Função será habilitada após regeneração automática dos tipos do Supabase
  // const loadUserStats = async (userId: string) => { ... }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Jogo de Anatomia</h1>
              <p className="text-sm text-muted-foreground">Bem-vindo de volta!</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">XP Total</CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.xp_total}</div>
              <p className="text-xs text-muted-foreground mt-1">Nível {Math.floor(stats.xp_total / 100)}</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-gradient-to-br from-secondary/10 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Elo</CardTitle>
                <Trophy className="w-4 h-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.elo}</div>
              <p className="text-xs text-muted-foreground mt-1">Ranking competitivo</p>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-gradient-to-br from-accent/10 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
                <Target className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.streak_days}</div>
              <p className="text-xs text-muted-foreground mt-1">dias consecutivos</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Energia</CardTitle>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stats.energy}/100</div>
                <Progress value={stats.energy} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="group hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Sprint</CardTitle>
                  <CardDescription>Responda o máximo em 2 minutos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Iniciar Sprint
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all cursor-pointer hover:border-secondary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Campanha</CardTitle>
                  <CardDescription>Progrida por sistemas anatômicos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Continuar Campanha
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all cursor-pointer hover:border-accent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Revisão (SRS)</CardTitle>
                  <CardDescription>Repita o que precisa revisar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">5 cartões devidos</span>
                <Badge>Hoje</Badge>
              </div>
              <Button className="w-full" variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Revisar Agora
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>OSCE</CardTitle>
                  <CardDescription>Casos clínicos integrados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Iniciar OSCE
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all cursor-pointer hover:border-accent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Ranking</CardTitle>
                  <CardDescription>Compare seu desempenho</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Ver Ranking
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all cursor-pointer hover:border-secondary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Social</CardTitle>
                  <CardDescription>Conecte-se com colegas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Ver Amigos
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Conquistas Recentes
            </CardTitle>
            <CardDescription>Continue jogando para desbloquear mais!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-muted/50 opacity-50"
                >
                  <Award className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-center text-muted-foreground">Conquista bloqueada</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
