"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LogViewer } from "@/components/ui/log-viewer";
import { usePlaygroundStore } from "@/store/playgroundStore";
import {
  FileText,
  Puzzle,
  Database,
  Clock,
  Zap,
  Hash,
  Search,
  BarChart3,
  RotateCcw,
  FlaskConical,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "green" | "yellow" | "purple" | "orange" | "red";
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}

function StatCard({ title, value, icon, color, subtitle, trend }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-200",
    green: "bg-green-500/10 text-green-600 border-green-200",
    yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    purple: "bg-purple-500/10 text-purple-600 border-purple-200",
    orange: "bg-orange-500/10 text-orange-600 border-orange-200",
    red: "bg-red-500/10 text-red-600 border-red-200",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2 mt-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {TrendIcon && <TrendIcon className="h-4 w-4 text-muted-foreground" />}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PipelineStageBarProps {
  stage: string;
  label: string;
  latency: number;
  maxLatency: number;
  color: string;
}

function PipelineStageBar({ stage, label, latency, maxLatency, color }: PipelineStageBarProps) {
  const percentage = maxLatency > 0 ? Math.round((latency / maxLatency) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{latency}ms</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function ExperimentDashboard() {
  const {
    file,
    chunks,
    embeddings,
    indexStats,
    retrievalResults,
    generationResult,
    evaluationMetrics,
    experimentLogs,
    addLog,
    resetExperiment,
  } = usePlaygroundStore();

  // Calculate aggregated stats
  const documentsUploaded = file ? 1 : 0;
  const chunksCreated = chunks.length;
  const vectorsIndexed = embeddings.length;
  const totalTokens =
    (generationResult?.inputTokens || 0) + (generationResult?.outputTokens || 0);
  const totalQueries = retrievalResults.length > 0 ? 1 : 0;

  // Calculate latencies
  const retrievalLatency = retrievalResults.length > 0 ? 150 : 0; // Mock average
  const generationLatency = generationResult?.latencyMs || 0;
  const indexingLatency = indexStats?.indexingLatencyMs || 0;
  const maxLatency = Math.max(retrievalLatency, generationLatency, indexingLatency, 1);

  const hasData = Boolean(file);

  const handleRecordExperiment = () => {
    const stats = {
      documents: documentsUploaded,
      chunks: chunksCreated,
      vectors: vectorsIndexed,
      tokens: totalTokens,
      queries: totalQueries,
    };

    addLog("experiment", `Experiment recorded: ${JSON.stringify(stats)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">10) Experiment Dashboard</h2>
          <p className="text-muted-foreground">
            Pipeline summary, aggregated metrics, and experiment tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetExperiment}
            disabled={experimentLogs.length === 0}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleRecordExperiment}
            disabled={!hasData}
            className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <FlaskConical className="mr-2 h-4 w-4" />
            Record Experiment
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {!hasData && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-200 rounded-lg flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">No experiment data available</p>
            <p className="text-sm text-yellow-700">
              Complete the pipeline stages to see aggregated metrics
            </p>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Documents Uploaded"
          value={documentsUploaded}
          icon={<FileText className="h-5 w-5" />}
          color="blue"
          subtitle={file?.documentName || "No document"}
        />
        <StatCard
          title="Chunks Created"
          value={chunksCreated}
          icon={<Puzzle className="h-5 w-5" />}
          color="green"
          subtitle={`${chunksCreated > 0 ? Math.round(chunksCreated / (documentsUploaded || 1)) : 0} per doc`}
        />
        <StatCard
          title="Vectors Indexed"
          value={vectorsIndexed}
          icon={<Database className="h-5 w-5" />}
          color="purple"
          subtitle={indexStats?.collectionName || "No index"}
        />
        <StatCard
          title="Total Tokens"
          value={totalTokens.toLocaleString()}
          icon={<Hash className="h-5 w-5" />}
          color="orange"
          subtitle={generationResult ? `${generationResult.inputTokens} in / ${generationResult.outputTokens} out` : "No generation"}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Retrieval Latency"
          value={`${retrievalLatency}ms`}
          icon={<Search className="h-5 w-5" />}
          color="blue"
          subtitle={retrievalResults.length > 0 ? `${retrievalResults.length} chunks retrieved` : "No retrieval"}
        />
        <StatCard
          title="Generation Latency"
          value={`${generationLatency}ms`}
          icon={<Zap className="h-5 w-5" />}
          color="yellow"
          subtitle={generationResult ? `${generationResult.chunksUsed} chunks used` : "No generation"}
        />
        <StatCard
          title="Total Queries"
          value={totalQueries}
          icon={<BarChart3 className="h-5 w-5" />}
          color="red"
          subtitle="Query iterations"
        />
      </div>

      {/* Pipeline Latency Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pipeline Stage Latencies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PipelineStageBar
            stage="indexing"
            label="Indexing"
            latency={indexingLatency}
            maxLatency={maxLatency}
            color="bg-blue-500"
          />
          <PipelineStageBar
            stage="retrieval"
            label="Retrieval"
            latency={retrievalLatency}
            maxLatency={maxLatency}
            color="bg-green-500"
          />
          <PipelineStageBar
            stage="generation"
            label="Generation"
            latency={generationLatency}
            maxLatency={maxLatency}
            color="bg-purple-500"
          />
        </CardContent>
      </Card>

      {/* Quality Metrics Summary */}
      {evaluationMetrics && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Evaluation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{evaluationMetrics.confidence}%</p>
                <p className="text-sm text-muted-foreground">Confidence</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{evaluationMetrics.faithfulness}%</p>
                <p className="text-sm text-muted-foreground">Faithfulness</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{evaluationMetrics.relevance}%</p>
                <p className="text-sm text-muted-foreground">Relevance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">${evaluationMetrics.estimatedCost.toFixed(4)}</p>
                <p className="text-sm text-muted-foreground">Est. Cost</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall Quality Score</span>
                <Badge
                  variant={
                    evaluationMetrics.responseQuality >= 80
                      ? "default"
                      : evaluationMetrics.responseQuality >= 60
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {evaluationMetrics.responseQuality}%
                </Badge>
              </div>
              <Progress value={evaluationMetrics.responseQuality} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experiment History */}
      <LogViewer logs={experimentLogs} stage="experiment" />
    </div>
  );
}
