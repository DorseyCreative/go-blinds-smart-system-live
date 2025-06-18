"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('customer_orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          setError('Failed to fetch order');
          console.error(error);
        } else {
          setOrder(data);
        }
        setLoading(false);
      };
      fetchOrder();
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const { error } = await supabase.from('customer_orders').delete().eq('id', id);
      if (error) {
        alert('Error deleting order');
      } else {
        alert('Order deleted');
        router.push('/admin/orders');
      }
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4">{error}</div>;
  if (!order) return <div className="p-4">Order not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order #{order.work_order_number}</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <p><strong>Customer:</strong> {order.customer_name}</p>
          <p><strong>Email:</strong> {order.email}</p>
          <p><strong>Phone:</strong> {order.phone_1}</p>
          <p><strong>Address:</strong> {order.address}, {order.city}, {order.state} {order.zip_code}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Quote:</strong> ${order.quote}</p>
          <p><strong>Scheduled:</strong> {order.scheduled_start_time ? new Date(order.scheduled_start_time).toLocaleString() : 'No'}</p>
        </div>
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Delete Order
          </button>
          <Link href="/admin/orders" className="text-blue-500 hover:text-blue-800">
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
} 