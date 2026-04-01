"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LogViewer } from "@/components/ui/log-viewer";
import { usePlaygroundStore } from "@/store/playgroundStore";
import {
  Activity,
  Clock,
  Database,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Target,
  BarChart3,
  RotateCcw,
  Calculator,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  progress?: number;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend = "neutral",
  color = "blue",
  progress,
}: MetricCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-200",
    green: "bg-green-500/10 text-green-600 border-green-200",
    yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    red: "bg-red-500/10 text-red-600 border-red-200",
    purple: "bg-purple-500/10 text-purple-600 border-purple-200",
  };

  const trendIcon =
    trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : trend === "down" ? (
      <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
    ) : null;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2 mt-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {trendIcon}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {progress !== undefined && (
              <div className="mt-3">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EvaluationStage() {
  const {
    evaluationMetrics,
    evaluationLogs,
    generationResult,
    calculateMetrics,
    resetEvaluation,
  } = usePlaygroundStore();

  const hasMetrics = Boolean(evaluationMetrics);
  const hasGenerationResult = Boolean(generationResult);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">9) Evaluation & Metrics</h2>
          <p className="text-muted-foreground">
            RAG pipeline observability and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetEvaluation}
            disabled={!hasMetrics}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={calculateMetrics}
            disabled={!hasGenerationResult}
            className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Metrics
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {!hasGenerationResult && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-200 rounded-lg flex items-center gap-3">
          <Activity className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">No generation result available</p>
            <p className="text-sm text-yellow-700">
              Run the generation stage first to calculate metrics
            </p>
          </div>
        </div>
      )}

      {hasMetrics && evaluationMetrics && (
        <>
          {/* Performance Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Latency"
              value={`${evaluationMetrics.latency}ms`}
              subtitle="End-to-end response time"
              icon={<Clock className="h-5 w-5" />}
              color="blue"
              trend={evaluationMetrics.latency < 1000 ? "up" : "neutral"}
            />
            <MetricCard
              title="Input Tokens"
              value={evaluationMetrics.inputTokens.toLocaleString()}
              subtitle="Tokens sent to LLM"
              icon={<Database className="h-5 w-5" />}
              color="purple"
            />
            <MetricCard
              title="Output Tokens"
              value={evaluationMetrics.outputTokens.toLocaleString()}
              subtitle="Tokens generated by LLM"
              icon={<BarChart3 className="h-5 w-5" />}
              color="green"
            />
            <MetricCard
              title="Estimated Cost"
              value={`$${evaluationMetrics.estimatedCost.toFixed(4)}`}
              subtitle="Based on provider pricing"
              icon={<DollarSign className="h-5 w-5" />}
              color="yellow"
            />
          </div>

          {/* Quality Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Confidence"
              value={`${evaluationMetrics.confidence}%`}
              subtitle="Based on retrieval scores"
              icon={<Target className="h-5 w-5" />}
              color="blue"
              progress={evaluationMetrics.confidence}
            />
            <MetricCard
              title="Faithfulness"
              value={`${evaluationMetrics.faithfulness}%`}
              subtitle="Response grounded in context"
              icon={<CheckCircle className="h-5 w-5" />}
              color="green"
              progress={evaluationMetrics.faithfulness}
            />
            <MetricCard
              title="Relevance"
              value={`${evaluationMetrics.relevance}%`}
              subtitle="Match to user query"
              icon={<Activity className="h-5 w-5" />}
              color="purple"
              progress={evaluationMetrics.relevance}
            />
            <MetricCard
              title="Context Utilization"
              value={`${evaluationMetrics.contextUtilization}%`}
              subtitle={`${evaluationMetrics.inputTokens > 0 ? Math.round((evaluationMetrics.inputTokens / 8192) * 100) : 0}% of context window`}
              icon={<Database className="h-5 w-5" />}
              color="yellow"
              progress={evaluationMetrics.contextUtilization}
            />
          </div>

          {/* Overall Quality Score */}
          <Card className="border-2 border-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Overall Response Quality</h3>
                    <p className="text-muted-foreground">
                      Aggregated score based on confidence, faithfulness, and relevance
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary">
                    {evaluationMetrics.responseQuality}%
                  </div>
                  <Badge
                    variant={
                      evaluationMetrics.responseQuality >= 80
                        ? "default"
                        : evaluationMetrics.responseQuality >= 60
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {evaluationMetrics.responseQuality >= 80
                      ? "Excellent"
                      : evaluationMetrics.responseQuality >= 60
                        ? "Good"
                        : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={evaluationMetrics.responseQuality} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Logs */}
      <LogViewer logs={evaluationLogs} stage="evaluation" />
    </div>
  );
}
