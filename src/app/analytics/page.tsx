"use client";
import { Brain } from "lucide-react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Calendar,
  Award,
  Users,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Analytics {
  totals: {
    total: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  };
  metrics: {
    applicationToInterviewRate: number;
  };
}

interface Job {
  _id: string;
  title?: string;
  company?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  keywords?: string[];
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // days

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, timeRange]);

  const fetchData = async () => {
    try {
      const [analyticsRes, jobsRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/jobs")
      ]);
      
      const analyticsData = await analyticsRes.json();
      const jobsData = await jobsRes.json();
      
      setAnalytics(analyticsData);
      setJobs(jobsData.data || []);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getJobsInTimeRange = () => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return jobs.filter(job => new Date(job.createdAt) >= cutoffDate);
  };

  const getStatusDistribution = () => {
    const recentJobs = getJobsInTimeRange();
    const distribution = recentJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return distribution;
  };

  const getTopKeywords = () => {
    const allKeywords = jobs.flatMap(job => job.keywords || []);
    const keywordCount = allKeywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(keywordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  };

  const getWeeklyActivity = () => {
    const recentJobs = getJobsInTimeRange();
    const weeks: Record<string, number> = {};
    
    recentJobs.forEach(job => {
      const date = new Date(job.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weeks[weekKey] = (weeks[weekKey] || 0) + 1;
    });
    
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8); // Last 8 weeks
  };

  const getCompanyStats = () => {
    const companyCount = jobs.reduce((acc, job) => {
      const company = job.company || "Unknown";
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(companyCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  };

  const getSuccessRate = () => {
    if (!analytics) return 0;
    const total = analytics.totals.applied;
    if (total === 0) return 0;
    return (analytics.totals.offer / total) * 100;
  };

  const getInterviewRate = () => {
    if (!analytics) return 0;
    return analytics.metrics.applicationToInterviewRate * 100;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C63FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please sign in to view analytics.</p>
      </div>
    );
  }

  const statusDistribution = getStatusDistribution();
  const topKeywords = getTopKeywords();
  const weeklyActivity = getWeeklyActivity();
  const companyStats = getCompanyStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6C63FF]/5 via-[#00C9A7]/5 to-[#6C63FF]/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your job search progress and insights</p>
          </div>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Button onClick={fetchData} variant="outline">
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.totals.total || 0}</p>
                </div>
                <Briefcase className="h-8 w-8 text-[#6C63FF]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interview Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(getInterviewRate())}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(getSuccessRate())}%
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Applications</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {(analytics?.totals.applied || 0) - (analytics?.totals.rejected || 0)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Application Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(statusDistribution).map(([status, count]) => {
                  const total = Object.values(statusDistribution).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">{status}</span>
                        <span className="text-sm text-gray-600">{count} ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#6C63FF] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Most Common Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topKeywords.length === 0 ? (
                  <p className="text-gray-500 text-sm">No keywords found</p>
                ) : (
                  topKeywords.map(([keyword, count], index) => (
                    <div key={keyword} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm font-medium">{keyword}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weeklyActivity.length === 0 ? (
                  <p className="text-gray-500 text-sm">No activity in selected period</p>
                ) : (
                  weeklyActivity.map(([week, count]) => (
                    <div key={week} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {new Date(week).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#00C9A7] h-2 rounded-full"
                            style={{ width: `${(count / Math.max(...weeklyActivity.map(([,c]) => c))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {companyStats.length === 0 ? (
                  <p className="text-gray-500 text-sm">No company data</p>
                ) : (
                  companyStats.map(([company, count], index) => (
                    <div key={company} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm font-medium">{company}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights & Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Performance Insights</h3>
                <div className="space-y-3">
                  {getInterviewRate() > 20 ? (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Great job!</strong> Your {Math.round(getInterviewRate())}% interview rate is above average.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Room for improvement:</strong> Consider tailoring your applications more carefully.
                      </p>
                    </div>
                  )}
                  
                  {getSuccessRate() > 10 ? (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Excellent!</strong> Your {Math.round(getSuccessRate())}% success rate shows strong interview skills.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Practice more interview questions to improve your success rate.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Action Items</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Focus on:</strong> {topKeywords.slice(0, 3).map(([k]) => k).join(", ")} skills
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Apply to more:</strong> {companyStats.slice(0, 2).map(([c]) => c).join(", ")} and similar companies
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Timing:</strong> You're most active on {weeklyActivity.length > 0 ? new Date(weeklyActivity[weeklyActivity.length - 1][0]).toLocaleDateString('en-US', { weekday: 'long' }) : 'weekdays'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
