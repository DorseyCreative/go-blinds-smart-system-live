"use client";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LineItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ code: '', description: '', price: '', duration_minutes: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<any>({});

  async function fetchItems() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('line_item_catalog')
      .select('*')
      .order('code', { ascending: true });
    if (error) setError(error.message);
    setItems(data || []);
    setLoading(false);
  }

  // Initial fetch
  useEffect(() => { fetchItems(); }, []);

  async function handleCreate(e: any) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const { code, description, price, duration_minutes } = newItem;
    if (!code || !description || !price || !duration_minutes) {
      setError('All fields are required.');
      return;
    }
    const { error } = await supabase.from('line_item_catalog').insert([
      {
        code,
        description,
        price: Number(price),
        duration_minutes: Number(duration_minutes),
        active: true,
      },
    ]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Line item created.');
      setNewItem({ code: '', description: '', price: '', duration_minutes: '' });
      fetchItems();
    }
  }

  async function handleEditSave(code: string) {
    setError(null);
    setSuccess(null);
    const { description, price, duration_minutes } = editRow;
    if (!description || !price || !duration_minutes) {
      setError('All fields are required.');
      return;
    }
    const { error } = await supabase
      .from('line_item_catalog')
      .update({
        description,
        price: Number(price),
        duration_minutes: Number(duration_minutes),
        updated_at: new Date().toISOString(),
      })
      .eq('code', code);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Line item updated.');
      setEditing(null);
      setEditRow({});
      fetchItems();
    }
  }

  async function handleToggleActive(code: string, active: boolean) {
    setError(null);
    setSuccess(null);
    const { error } = await supabase
      .from('line_item_catalog')
      .update({ active: !active, updated_at: new Date().toISOString() })
      .eq('code', code);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Status updated.');
      fetchItems();
    }
  }

  return (
    <div>
      <h1>Line Item Catalog</h1>
      <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <input
          placeholder="Code"
          value={newItem.code}
          onChange={e => setNewItem({ ...newItem, code: e.target.value })}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="Description"
          value={newItem.description}
          onChange={e => setNewItem({ ...newItem, description: e.target.value })}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="Price"
          type="number"
          value={newItem.price}
          onChange={e => setNewItem({ ...newItem, price: e.target.value })}
          style={{ marginRight: 8, width: 80 }}
        />
        <input
          placeholder="Duration (min)"
          type="number"
          value={newItem.duration_minutes}
          onChange={e => setNewItem({ ...newItem, duration_minutes: e.target.value })}
          style={{ marginRight: 8, width: 120 }}
        />
        <button type="submit">Add Line Item</button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : !items.length ? (
        <div>No line items found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Code</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Description</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Price ($)</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Duration (min)</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Active</th>
              <th style={{ borderBottom: '1px solid #ccc' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item.code}>
                <td>{item.code}</td>
                <td>
                  {editing === item.code ? (
                    <input
                      value={editRow.description}
                      onChange={e => setEditRow({ ...editRow, description: e.target.value })}
                    />
                  ) : (
                    item.description
                  )}
                </td>
                <td>
                  {editing === item.code ? (
                    <input
                      type="number"
                      value={editRow.price}
                      onChange={e => setEditRow({ ...editRow, price: e.target.value })}
                      style={{ width: 80 }}
                    />
                  ) : (
                    item.price
                  )}
                </td>
                <td>
                  {editing === item.code ? (
                    <input
                      type="number"
                      value={editRow.duration_minutes}
                      onChange={e => setEditRow({ ...editRow, duration_minutes: e.target.value })}
                      style={{ width: 120 }}
                    />
                  ) : (
                    item.duration_minutes
                  )}
                </td>
                <td>{item.active ? 'Yes' : 'No'}</td>
                <td>
                  {editing === item.code ? (
                    <>
                      <button onClick={() => handleEditSave(item.code)}>Save</button>{' '}
                      <button onClick={() => { setEditing(null); setEditRow({}); }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditing(item.code); setEditRow(item); }}>Edit</button>{' '}
                      <button onClick={() => handleToggleActive(item.code, item.active)}>
                        {item.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 