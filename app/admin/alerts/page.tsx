'use client';

import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'new'>('new');

  async function fetchAlerts() {
    setLoading(true);
    setError(null);
    let query = supabase.from('system_alerts').select('*').order('created_at', { ascending: false }).limit(50);
    if (filter === 'new') {
      query = query.eq('status', 'new');
    }
    const { data, error } = await query;
    if (error) setError(error.message);
    setAlerts(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchAlerts(); }, [filter]);

  async function handleMarkRead(id: number) {
    setError(null);
    setSuccess(null);
    const { error } = await supabase
      .from('system_alerts')
      .update({ status: 'acknowledged' })
      .eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Alert marked as read.');
      fetchAlerts();
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">System Alerts</h1>
      <div className="mb-4">
        <button 
          onClick={() => setFilter('new')} 
          className={`px-4 py-2 rounded mr-2 ${filter === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          disabled={filter === 'new'}
        >
          Show New
        </button>
        <button 
          onClick={() => setFilter('all')} 
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          disabled={filter === 'all'}
        >
          Show All
        </button>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        {loading ? (
          <div>Loading...</div>
        ) : !alerts.length ? (
          <div>No alerts found for the selected filter.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Type</th>
                <th className="p-2">Message</th>
                <th className="p-2">Created At</th>
                <th className="p-2">Status</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert: any) => (
                <tr key={alert.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{alert.type}</td>
                  <td className="p-2">{alert.message}</td>
                  <td className="p-2">{new Date(alert.created_at).toLocaleString()}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${alert.status === 'new' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    {alert.status === 'new' ? (
                      <button 
                        onClick={() => handleMarkRead(alert.id)}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                      >
                        Mark as Read
                      </button>
                    ) : (
                      <span className="text-gray-400">Read</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 