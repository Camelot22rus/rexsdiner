import React, { useEffect, useState } from "react";
import { API_BASE_URL } from '../config';
import { createBusinessApiUrl } from '../services/api';
import { useSelector } from "react-redux";
import { selectUser } from "../redux/user/selectors";
import styles from './FridgeModal.module.scss';

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
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector(selectUser);
  const [clearedInputs, setClearedInputs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    fetch(createBusinessApiUrl('/inventory'))
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

  const handleChange = (name: string, value: string) => {
    setEdited((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputFocus = (name: string) => {
    setClearedInputs(prev => {
      if (!prev.has(name)) {
        setEdited(e => ({ ...e, [name]: "" }));
        return new Set(prev).add(name);
      }
      return prev;
    });
  };

  const handlePlus = (name: string) => {
    const currentStr = edited[name] !== undefined ? edited[name] : String(inventory.find(i => i.name === name)?.quantity || 0);
    const current = currentStr === "" ? 0 : parseInt(currentStr, 10);
    setEdited((prev) => ({ ...prev, [name]: String(current + 1) }));
  };

  const handleMinus = (name: string) => {
    const currentStr = edited[name] !== undefined ? edited[name] : String(inventory.find(i => i.name === name)?.quantity || 0);
    const current = currentStr === "" ? 0 : parseInt(currentStr, 10);
    setEdited((prev) => ({ ...prev, [name]: String(Math.max(0, current - 1)) }));
  };

  const handleInputBlur = (name: string) => {
    if (edited[name] === "") {
      const orig = inventory.find(i => i.name === name)?.quantity;
      setEdited(prev => ({ ...prev, [name]: orig !== undefined ? String(orig) : "0" }));
    }
  };

  // Check if any value in edited differs from inventory
  const hasChanges = Object.keys(edited).some(name => {
    const orig = inventory.find(i => i.name === name)?.quantity;
    // Compare as string for leading zeros, but treat empty as 0
    return orig !== undefined && (edited[name] === "" ? 0 : Number(edited[name])) !== orig;
  });

  const handleSave = async () => {
    if (!user || !hasChanges) return;

    setSaving(true);
    setError(null);

    try {
      // Prepare the list of changed items
      const items = Object.keys(edited)
        .filter(name => {
          const orig = inventory.find(i => i.name === name)?.quantity;
          return orig !== undefined && (edited[name] === "" ? 0 : Number(edited[name])) !== orig;
        })
        .map(name => ({
          name,
          quantity: edited[name] === "" ? 0 : Number(edited[name])
        }));

      if (items.length === 0) {
        setSaving(false);
        return;
      }

      const response = await fetch(createBusinessApiUrl('/inventory'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          userId: user.id
        })
      });

      const data = await response.json();

      if (data.status === "success") {
        // Update local inventory with saved values
        setInventory(prevInventory => 
          prevInventory.map(item => {
            if (edited[item.name] !== undefined) {
              return { ...item, quantity: edited[item.name] === "" ? 0 : Number(edited[item.name]) };
            }
            return item;
          })
        );
        
        // Clear edited state
        setEdited({});
        
        // Show success message briefly
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setError(data.message || "Ошибка сохранения инвентаря");
      }
    } catch (err) {
      setError("Ошибка сохранения инвентаря");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className={styles.fridgeModal}>
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
            <div className={styles.fridgeInventoryList}>
              {inventory.map((item) => {
                const value = edited[item.name] !== undefined ? edited[item.name] : String(item.quantity);
                const changed = (value === "" ? 0 : Number(value)) !== item.quantity;
                return (
                  <div key={item.name} className={styles.fridgeInventoryItem} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ flex: 1 }}>{item.name}</span>
                    <button type="button" onClick={() => handleMinus(item.name)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-color, #eee)', background: '#f5f5f5', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>-</button>
                    <input
                      type="number"
                      value={value}
                      onChange={e => handleChange(item.name, e.target.value)}
                      onFocus={() => handleInputFocus(item.name)}
                      onBlur={() => handleInputBlur(item.name)}
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
            <button 
              type="submit" 
              disabled={!hasChanges || saving} 
              style={{ 
                marginTop: 24, 
                width: '100%', 
                background: hasChanges && !saving ? 'var(--accent-color, #fe5f1e)' : '#ccc', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: '12px 0', 
                fontSize: 16, 
                fontWeight: 600, 
                cursor: hasChanges && !saving ? 'pointer' : 'not-allowed', 
                opacity: hasChanges && !saving ? 1 : 0.7 
              }}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FridgeModal; 