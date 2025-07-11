import React, { useEffect, useState } from "react";
import { API_BASE_URL } from '../config';

interface InventoryItem {
  name: string;
  quantity: number;
  date?: string;
  unit?: string;
}

interface FridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FridgeModal: React.FC<FridgeModalProps> = ({ isOpen, onClose }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [edited, setEdited] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/inventory`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setInventory(data.data);
          setEdited({});
        } else {
          setError(data.message || "Ошибка загрузки инвентаря");
        }
      })
      .catch(() => setError("Ошибка загрузки инвентаря"))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleChange = (name: string, value: string | number) => {
    setEdited((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handlePlus = (name: string) => {
    const current = edited[name] !== undefined ? edited[name] : inventory.find(i => i.name === name)?.quantity || 0;
    setEdited((prev) => ({ ...prev, [name]: current + 1 }));
  };

  const handleMinus = (name: string) => {
    const current = edited[name] !== undefined ? edited[name] : inventory.find(i => i.name === name)?.quantity || 0;
    setEdited((prev) => ({ ...prev, [name]: Math.max(0, current - 1) }));
  };

  // Check if any value in edited differs from inventory
  const hasChanges = Object.keys(edited).some(name => {
    const orig = inventory.find(i => i.name === name)?.quantity;
    return orig !== undefined && edited[name] !== orig;
  });

  const handleSave = () => {
    // TODO: Implement save logic (API call)
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal" style={{ background: 'var(--surface-color, #fff)', borderRadius: 16, maxWidth: 400, width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid var(--border-color, #eee)', padding: 24, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Инвентарь</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-secondary, #888)' }}>×</button>
        </div>
        {loading ? (
          <div>Загрузка...</div>
        ) : error ? (
          <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {inventory.map((item) => {
                const value = edited[item.name] !== undefined ? edited[item.name] : item.quantity;
                const changed = value !== item.quantity;
                return (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ flex: 1 }}>{item.name}</span>
                    <button type="button" onClick={() => handleMinus(item.name)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-color, #eee)', background: '#f5f5f5', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>-</button>
                    <input
                      type="number"
                      value={value}
                      onChange={e => handleChange(item.name, e.target.value)}
                      style={{
                        width: 60,
                        padding: 6,
                        borderRadius: 6,
                        border: '1px solid var(--border-color, #eee)',
                        textAlign: 'center',
                        background: changed ? '#22dace' : 'white',
                        transition: 'background 0.2s',
                      }}
                    />
                    <button type="button" onClick={() => handlePlus(item.name)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-color, #eee)', background: '#f5f5f5', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>+</button>
                    {item.unit && <span>{item.unit}</span>}
                  </div>
                );
              })}
            </div>
            <button type="submit" disabled={!hasChanges} style={{ marginTop: 24, width: '100%', background: hasChanges ? 'var(--accent-color, #fe5f1e)' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 16, fontWeight: 600, cursor: hasChanges ? 'pointer' : 'not-allowed', opacity: hasChanges ? 1 : 0.7 }}>
              Сохранить
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FridgeModal; 