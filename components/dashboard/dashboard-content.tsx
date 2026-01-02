
'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Eye,
  LogOut,
  Menu,
  Home,
  Target,
  Users,
  Zap,
  Sparkles,
  Brain,
  Calendar,
  Settings,
  BookOpen,
  Box,
  Maximize2
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { CoherenceMeters } from './coherence-meters';
import { TimelineViewer } from './timeline-viewer';
import { ProjectsPanel } from './projects-panel';
import { EnergyFlows } from './energy-flows';
import { RelationshipsMap } from './relationships-map';
import { SynchronicityTracker } from './synchronicity-tracker';
import { AIAnalysis } from './ai-analysis';
import GameBoard from './game-board';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function DashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gameBoardData, setGameBoardData] = useState({
    projects: [],
    relationships: [],
    manifestations: [],
    entries: [],
  });

  // Cargar datos para el tablero de juego
  useEffect(() => {
    const fetchGameBoardData = async () => {
      try {
        const [projectsRes, relationshipsRes, manifestationsRes, entriesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/relationships'),
          fetch('/api/dashboard/manifestations'),
          fetch('/api/daily-mapping/entries?limit=10'),
        ]);

        const projects = projectsRes.ok ? await projectsRes.json() : [];
        const relationships = relationshipsRes.ok ? await relationshipsRes.json() : [];
        const manifestations = manifestationsRes.ok ? await manifestationsRes.json() : [];
        const entries = entriesRes.ok ? await entriesRes.json() : [];

        setGameBoardData({ projects, relationships, manifestations, entries });
      } catch (error) {
        console.error('Error loading game board data:', error);
      }
    };

    if (session) {
      fetchGameBoardData();
    }
  }, [session]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleNewProject = () => {
    // Scroll to projects panel and trigger the add button click
    const projectsPanel = document.querySelector('[data-testid="projects-panel"]');
    if (projectsPanel) {
      projectsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Wait for scroll to complete, then click the + button
      setTimeout(() => {
        const addButton = projectsPanel.querySelector('button[aria-label="Agregar proyecto"]');
        if (addButton) {
          (addButton as HTMLButtonElement).click();
        }
      }, 500);
    }
  };

  const handleNewSynchronicity = () => {
    // Scroll to synchronicity tracker
    const syncPanel = document.querySelector('[data-testid="sync-tracker"]');
    if (syncPanel) {
      syncPanel.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNewRelationship = () => {
    // Scroll to relationships map
    const relPanel = document.querySelector('[data-testid="relationships-map"]');
    if (relPanel) {
      relPanel.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAIAnalysis = () => {
    // Scroll to AI analysis panel
    const aiPanel = document.querySelector('[data-testid="ai-analysis"]');
    if (aiPanel) {
      aiPanel.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (testId: string) => {
    const element = document.querySelector(`[data-testid="${testId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSidebarOpen(false); // Close mobile sidebar after navigation
    }
  };

  const navigationItems = [
    { name: 'Vista General', icon: Home, action: () => window.scrollTo({ top: 0, behavior: 'smooth' }), current: true },
    { name: 'Tablero 3D', icon: Box, action: () => router.push('/tablero-3d'), current: false, highlight: true },
    { name: 'Proyectos', icon: Target, action: () => scrollToSection('projects-panel'), current: false },
    { name: 'Relaciones', icon: Users, action: () => scrollToSection('relationships-map'), current: false },
    { name: 'Timeline', icon: Calendar, action: () => scrollToSection('timeline-viewer'), current: false },
    { name: 'Energía', icon: Zap, action: () => scrollToSection('energy-flows'), current: false },
    { name: 'Sincronicidades', icon: Sparkles, action: () => scrollToSection('sync-tracker'), current: false },
    { name: 'Configuración', icon: Settings, action: () => router.push('/dashboard'), current: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-purple-900/20 overflow-x-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on all screens */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-r border-purple-500/20 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center gap-3 p-6 border-b border-purple-500/20">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                OBSERVADOR
              </h1>
              <p className="text-sm text-cyan-300">4D</p>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {session?.user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={item.action}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  item.current 
                    ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border border-purple-500/30' 
                    : (item as any).highlight
                    ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white border border-cyan-500/50 hover:from-cyan-500/40 hover:to-purple-500/40 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.name}</span>
                {(item as any).highlight && (
                  <span className="ml-auto text-xs bg-cyan-500/30 px-2 py-0.5 rounded-full border border-cyan-500/50">
                    3D
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-slate-700/50">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 lg:ml-64">
        {/* Top Header */}
        <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-slate-400"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Dashboard 4D
                </h1>
                <p className="text-slate-400 text-sm">
                  Perspectiva macro de tu realidad dimensional
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-200">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-slate-400">
                  Observador Activo
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="p-4 lg:p-6 overflow-x-hidden">
          <div className="w-full max-w-full">
            {/* Tablero de Juego 4D - Visión Aérea Principal */}
            <div className="mb-6" data-testid="game-board">
              <div className="mb-4 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Tablero 4D: Visión Macro
                  </span>
                </h2>
                <p className="text-slate-400 text-sm">
                  Perspectiva aérea de tu realidad dimensional - Observa desde arriba
                </p>
              </div>
              
              {/* Botón prominente para acceder al Tablero 3D */}
              <Card className="mb-6 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border-2 border-cyan-500/50 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                        <Box className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent mb-1">
                          Tablero 3D Cuántico
                        </h3>
                        <p className="text-slate-300 text-sm">
                          Explora tu realidad con profundidad real, vista cenital y parallax auténtico
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push('/tablero-3d')}
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/30 border-0"
                    >
                      <Maximize2 className="mr-2 h-5 w-5" />
                      Abrir Vista 3D
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <GameBoard recentData={gameBoardData} />
            </div>

            {/* Métricas de Coherencia - Estado Actual */}
            <div className="mb-8">
              <CoherenceMeters />
            </div>

            {/* Secciones Full Width - Una debajo de otra */}
            <div className="space-y-6 mb-8">
              {/* Timeline */}
              <div data-testid="timeline-viewer" className="w-full">
                <TimelineViewer />
              </div>

              {/* Proyectos */}
              <div data-testid="projects-panel" className="w-full">
                <ProjectsPanel />
              </div>

              {/* Flujos de Energía */}
              <div data-testid="energy-flows" className="w-full">
                <EnergyFlows />
              </div>

              {/* Sincronicidades */}
              <div data-testid="sync-tracker" className="w-full">
                <SynchronicityTracker />
              </div>

              {/* Relaciones */}
              <div data-testid="relationships-map" className="w-full">
                <RelationshipsMap />
              </div>
            </div>

            {/* Análisis IA - Ancho Completo */}
            <div className="mt-8" data-testid="ai-analysis">
              <AIAnalysis />
            </div>

            {/* Panel de Acciones Rápidas */}
            <Card className="mt-8 bg-gradient-to-r from-slate-900/50 to-purple-900/20 border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-200 text-center">
                  Acciones Rápidas 4D
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20"
                    onClick={() => router.push('/daily-mapping')}
                  >
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Mapeo Diario</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    onClick={handleNewProject}
                  >
                    <Target className="h-6 w-6" />
                    <span className="text-sm">Nuevo Proyecto</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                    onClick={handleNewSynchronicity}
                  >
                    <Sparkles className="h-6 w-6" />
                    <span className="text-sm">Registrar Sincronicidad</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                    onClick={handleNewRelationship}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Agregar Relación</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/20"
                    onClick={handleAIAnalysis}
                  >
                    <Brain className="h-6 w-6" />
                    <span className="text-sm">Análisis IA</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
