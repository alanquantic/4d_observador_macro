'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Key, 
  Copy, 
  Check, 
  Trash2, 
  Settings, 
  ArrowLeft,
  Activity,
  DollarSign,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  Pause,
  Play,
  AlertTriangle,
  Code,
  Globe
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// Projects Hub - Panel de Gestión de Proyectos Externos
// Aquí se registran Legal Shield, Capital Miner, etc.
// ═══════════════════════════════════════════════════════════════════════════

interface ExternalProject {
  id: string;
  name: string;
  description: string | null;
  projectType: string;
  apiKeyPrefix: string;
  webhookUrl: string | null;
  status: string;
  agentMode: string;
  currentBalance: number;
  totalRevenue: number;
  monthlyRevenue: number;
  lastTransactionAt: string | null;
  transactionsCount: number;
  decisionsCount: number;
  createdAt: string;
}

interface NewProjectCredentials {
  projectId: string;
  apiKey: string;
  apiKeyPrefix: string;
  ingestEndpoint: string;
}

export default function ProjectsHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [projects, setProjects] = useState<ExternalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Form para nuevo proyecto
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  // Credenciales recién creadas
  const [newCredentials, setNewCredentials] = useState<NewProjectCredentials | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/external-projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status, router, fetchProjects]);

  const handleCreateProject = async () => {
    if (!newName.trim()) return;
    
    setCreating(true);
    try {
      const res = await fetch('/api/external-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          description: newDescription || null,
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setNewCredentials(data.credentials);
        setNewName('');
        setNewDescription('');
        setShowNewForm(false);
        fetchProjects();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyApiKey = () => {
    if (newCredentials?.apiKey) {
      navigator.clipboard.writeText(newCredentials.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChangeMode = async (projectId: string, newMode: string) => {
    try {
      await fetch('/api/external-projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, agentMode: newMode })
      });
      fetchProjects();
    } catch (error) {
      console.error('Error changing mode:', error);
    }
  };

  const handleDeleteProject = async (projectId: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?\n\nEsta acción no se puede deshacer.`)) return;
    
    try {
      await fetch(`/api/external-projects?projectId=${projectId}`, {
        method: 'DELETE'
      });
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-purple-900/20 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-purple-900/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Projects Hub
              </h1>
              <p className="text-slate-400 text-sm">
                Gestiona tus proyectos externos con agentes de IA
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowNewForm(true)}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>

        {/* Modal de Credenciales Nuevas */}
        {newCredentials && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-slate-900 border-green-500/50 max-w-2xl w-full">
              <CardHeader className="border-b border-green-500/30">
                <CardTitle className="flex items-center gap-3 text-green-400">
                  <Key className="h-6 w-6" />
                  ¡Proyecto Creado!
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 font-medium">⚠️ Guarda esta API Key</p>
                      <p className="text-yellow-300/80 text-sm">
                        No se mostrará de nuevo. Si la pierdes, deberás regenerarla.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Project ID</label>
                  <code className="bg-slate-800 px-4 py-2 rounded block font-mono text-cyan-400">
                    {newCredentials.projectId}
                  </code>
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 block mb-2">API Key</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-800 px-4 py-2 rounded font-mono text-green-400 overflow-x-auto">
                      {showApiKey ? newCredentials.apiKey : '•'.repeat(40)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyApiKey}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Endpoint de Ingesta</label>
                  <code className="bg-slate-800 px-4 py-2 rounded block font-mono text-purple-400 text-sm">
                    POST https://4d-observador-macro.vercel.app/api/external/ingest
                  </code>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Ejemplo de uso:</p>
                  <pre className="text-xs text-slate-300 overflow-x-auto">
{`curl -X POST https://4d-observador-macro.vercel.app/api/external/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${showApiKey ? newCredentials.apiKey : 'obs_xxxxx...'}" \\
  -d '{
    "contextType": "pricing_request",
    "actionTaken": "increase_price",
    "actionLabel": "Precio +40%",
    "revenueGenerated": 50.00,
    "outcome": "accepted"
  }'`}
                  </pre>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setNewCredentials(null);
                      setShowApiKey(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Entendido, ya guardé la API Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Nuevo Proyecto */}
        {showNewForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-slate-900 border-cyan-500/50 max-w-lg w-full">
              <CardHeader className="border-b border-cyan-500/30">
                <CardTitle className="flex items-center gap-3 text-cyan-400">
                  <Plus className="h-6 w-6" />
                  Nuevo Proyecto Externo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Nombre del Proyecto *</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Legal Shield, Capital Miner..."
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Descripción (opcional)</label>
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Breve descripción del proyecto..."
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400">
                    Se generará automáticamente una <strong className="text-cyan-400">API Key</strong> única
                    para que tu proyecto pueda enviar datos a OBSERVADOR4D.
                  </p>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowNewForm(false);
                      setNewName('');
                      setNewDescription('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newName.trim() || creating}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    {creating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    Crear y Obtener API Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Proyectos */}
        {projects.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-12 text-center">
              <Globe className="h-16 w-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl text-slate-300 mb-2">Sin proyectos externos</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Registra tus proyectos con agentes de IA (Legal Shield, Capital Miner, etc.)
                para monitorearlos desde OBSERVADOR4D.
              </p>
              <Button
                onClick={() => setShowNewForm(true)}
                className="bg-gradient-to-r from-cyan-500 to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primer Proyecto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id}
                className={`bg-slate-900/50 border transition-all ${
                  project.status === 'active' 
                    ? 'border-slate-700/50 hover:border-cyan-500/50' 
                    : 'border-red-500/30 opacity-75'
                }`}
              >
                <CardHeader className="border-b border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        {project.name}
                        {project.agentMode === 'paused' && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                            PAUSADO
                          </span>
                        )}
                      </CardTitle>
                      {project.description && (
                        <p className="text-sm text-slate-400 mt-1">{project.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 space-y-4">
                  {/* Métricas */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <DollarSign className="h-4 w-4 text-green-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-green-400">
                        {formatCurrency(project.totalRevenue)}
                      </p>
                      <p className="text-xs text-slate-500">Total</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <Zap className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-yellow-400">
                        {formatCurrency(project.monthlyRevenue)}
                      </p>
                      <p className="text-xs text-slate-500">Este Mes</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <Activity className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-cyan-400">
                        {project.decisionsCount}
                      </p>
                      <p className="text-xs text-slate-500">Decisiones</p>
                    </div>
                  </div>
                  
                  {/* API Key Info */}
                  <div className="bg-slate-800/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-purple-400" />
                        <code className="text-sm text-purple-400">{project.apiKeyPrefix}</code>
                      </div>
                      <span className="text-xs text-slate-500">
                        Creado: {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Controles de Modo */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={project.agentMode === 'auto' ? 'default' : 'outline'}
                      onClick={() => handleChangeMode(project.id, 'auto')}
                      className="flex-1"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Auto
                    </Button>
                    <Button
                      size="sm"
                      variant={project.agentMode === 'manual' ? 'default' : 'outline'}
                      onClick={() => handleChangeMode(project.id, 'manual')}
                      className="flex-1"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Manual
                    </Button>
                    <Button
                      size="sm"
                      variant={project.agentMode === 'paused' ? 'destructive' : 'outline'}
                      onClick={() => handleChangeMode(project.id, 'paused')}
                      className="flex-1"
                    >
                      <Pause className="h-3 w-3 mr-1" />
                      Pausa
                    </Button>
                  </div>
                  
                  {/* Link a documentación */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-400 hover:text-cyan-400"
                    onClick={() => window.open('/api/external/ingest', '_blank')}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Ver Documentación de API
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Documentación rápida */}
        <Card className="mt-8 bg-slate-900/30 border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-lg text-slate-300 flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-400" />
              Integración Rápida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              Para enviar datos desde tu proyecto externo a OBSERVADOR4D:
            </p>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <pre className="text-sm text-slate-300 overflow-x-auto">
{`// Ejemplo en JavaScript/Node.js
const response = await fetch('https://4d-observador-macro.vercel.app/api/external/ingest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'TU_API_KEY_AQUI'
  },
  body: JSON.stringify({
    contextType: 'pricing_request',    // Tipo de decisión
    actionTaken: 'increase_price',      // Acción tomada
    actionLabel: 'Precio +40%',         // Etiqueta legible
    revenueGenerated: 50.00,            // Dinero generado
    outcome: 'accepted',                // Resultado
    agentName: 'PricingAgent',          // Nombre del agente
    riskLevel: 0.7                      // Nivel de riesgo 0-1
  })
});`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
