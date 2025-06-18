'use client';

import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState({ customer_name: '', work_order_number: '', status: 'Pending', labor_to_do: '' });

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('customer_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setOrders(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchOrders(); }, []);

  async function handleCreate(e: any) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const { customer_name, work_order_number, status, labor_to_do } = newOrder;
    if (!customer_name || !work_order_number || !status) {
      setError('Customer name, work order number, and status are required.');
      return;
    }
    const { error } = await supabase.from('customer_orders').insert([
      {
        customer_name,
        work_order_number,
        status,
        labor_to_do,
      },
    ]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Order created successfully.');
      setNewOrder({ customer_name: '', work_order_number: '', status: 'Pending', labor_to_do: '' });
      fetchOrders();
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Orders</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Add New Order</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="p-2 border rounded"
            placeholder="Customer Name"
            value={newOrder.customer_name}
            onChange={e => setNewOrder({ ...newOrder, customer_name: e.target.value })}
          />
          <input
            className="p-2 border rounded"
            placeholder="Work Order Number"
            value={newOrder.work_order_number}
            onChange={e => setNewOrder({ ...newOrder, work_order_number: e.target.value })}
          />
          <select
            className="p-2 border rounded"
            value={newOrder.status}
            onChange={e => setNewOrder({ ...newOrder, status: e.target.value })}
          >
            <option>Pending</option>
            <option>Scheduled</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
          <textarea
            className="p-2 border rounded md:col-span-2"
            placeholder="Labor To Do (optional)"
            value={newOrder.labor_to_do}
            onChange={e => setNewOrder({ ...newOrder, labor_to_do: e.target.value })}
          />
          <div className="md:col-span-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add Order
            </button>
          </div>
        </form>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

      <div className="bg-white p-4 rounded-lg shadow-md">
        {loading ? (
          <div>Loading...</div>
        ) : !orders.length ? (
          <div>No orders found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Customer</th>
                <th className="p-2">Work Order #</th>
                <th className="p-2">Status</th>
                <th className="p-2">Labor To Do</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{order.customer_name}</td>
                  <td className="p-2">{order.work_order_number}</td>
                  <td className="p-2">{order.status}</td>
                  <td className="p-2 truncate max-w-xs">{order.labor_to_do}</td>
                  <td className="p-2 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300">
                      Edit
                    </Link>
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