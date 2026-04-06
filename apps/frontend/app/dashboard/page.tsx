"use client";
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Globe, Plus } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';
import axios from 'axios';
import { API_BACKEND_URL } from '@/config';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';

type UptimeStatus = "good" | "bad" | "unknown";

function StatusCircle({ status }: { status: UptimeStatus }) {
  return (
    <div className={`w-3 h-3 rounded-full ${status === 'good' ? 'bg-green-500' : status === 'bad' ? 'bg-red-500' : 'bg-gray-500'}`} />
  );
}

function UptimeTicks({ ticks }: { ticks: UptimeStatus[] }) {
  return (
    <div className="flex gap-1 mt-2">
      {ticks.map((tick, index) => (
        <div
          key={index}
          className={`w-8 h-2 rounded ${
            tick === 'good' ? 'bg-green-500' : tick === 'bad' ? 'bg-red-500' : 'bg-gray-500'
          }`}
        />
      ))}
    </div>
  );
}

function CreateWebsiteModal({ isOpen, onClose }: { isOpen: boolean; onClose: (url: string | null) => void }) {
  const [url, setUrl] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Add New Website</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => onClose(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => onClose(url)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Add Website
            </button>
          </div>
      </div>
    </div>
  );
}

interface ProcessedWebsite {
  id: string;
  url: string;
  status: UptimeStatus;
  uptimePercentage: number;
  lastChecked: string;
  uptimeTicks: UptimeStatus[];
}

function WebsiteCard({ website }: { website: ProcessedWebsite }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <StatusCircle status={website.status} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{website.url}</h3>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {website.uptimePercentage.toFixed(1)}% uptime
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
          <div className="mt-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Last 30 minutes status:</p>
            <UptimeTicks ticks={website.uptimeTicks} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Last checked: {website.lastChecked}
          </p>
        </div>
      )}
    </div>
  );
}

function GuestDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300">
              Dashboard Preview
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Open the SentinelNet dashboard and start tracking uptime.
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              You can land on the dashboard directly. Sign in when you are ready to add monitors, store checks, and manage your validator-backed uptime data.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SignInButton mode="modal">
                <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400">
                  Sign in to continue
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800">
                  Create an account
                </button>
              </SignUpButton>
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Global visibility</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Review distributed validator checks from a single dashboard.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Quick setup</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Add websites in seconds and let SentinelNet monitor them continuously.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Trust-minimized uptime</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Use independent validator reports instead of a single centralized checker.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const tokenGetter = isSignedIn ? getToken : null;
  const {websites, refreshWebsites} = useWebsites(tokenGetter);

  const processedWebsites = useMemo(() => {
    return websites.map(website => {
      // Sort ticks by creation time
      const sortedTicks = [...website.ticks].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Get the most recent 30 minutes of ticks
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentTicks = sortedTicks.filter(tick => 
        new Date(tick.createdAt) > thirtyMinutesAgo
      );

      // Aggregate ticks into 3-minute windows (10 windows total)
      const windows: UptimeStatus[] = [];

      for (let i = 0; i < 10; i++) {
        const windowStart = new Date(Date.now() - (i + 1) * 3 * 60 * 1000);
        const windowEnd = new Date(Date.now() - i * 3 * 60 * 1000);
        
        const windowTicks = recentTicks.filter(tick => {
          const tickTime = new Date(tick.createdAt);
          return tickTime >= windowStart && tickTime < windowEnd;
        });

        // Window is considered up if majority of ticks are up
        const upTicks = windowTicks.filter(tick => tick.status === 'Good').length;
        windows[9 - i] = windowTicks.length === 0 ? "unknown" : (upTicks / windowTicks.length) >= 0.5 ? "good" : "bad";
      }

      // Calculate overall status and uptime percentage
      const totalTicks = sortedTicks.length;
      const upTicks = sortedTicks.filter(tick => tick.status === 'Good').length;
      const uptimePercentage = totalTicks === 0 ? 100 : (upTicks / totalTicks) * 100;

      // Get the most recent status
      const currentStatus = windows[windows.length - 1];

      // Format the last checked time
      const lastChecked = sortedTicks[0]
        ? new Date(sortedTicks[0].createdAt).toLocaleTimeString()
        : 'Never';

      return {
        id: website.id,
        url: website.url,
        status: currentStatus,
        uptimePercentage,
        lastChecked,
        uptimeTicks: windows,
      };
    });
  }, [websites]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <GuestDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Uptime Monitor</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Website</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {processedWebsites.map((website) => (
            <WebsiteCard key={website.id} website={website} />
          ))}
        </div>
      </div>

      <CreateWebsiteModal
        isOpen={isModalOpen}
        onClose={async (url) => {
            if (url === null) {
                setIsModalOpen(false);
                return;
            }

            const token = await getToken();
            setIsModalOpen(false)
            
            if (!token) {
                alert('Authentication failed. Please sign in again.');
                return;
            }

            axios.post(`${API_BACKEND_URL}/api/v1/website`, {
                url,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(() => {
                refreshWebsites();
                alert('Website added successfully!');
            })
            .catch((error) => {
                console.error('Error adding website:', error);
                alert(`Failed to add website: ${error.response?.data?.details || error.message}`);
            })
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return <Dashboard />;
}
