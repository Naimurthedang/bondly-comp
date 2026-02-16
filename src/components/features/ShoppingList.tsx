import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
}

const categories = ["Groceries", "Baby", "Household", "Other"];

const ShoppingList = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState("Groceries");

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), name: newItem.trim(), category: newCategory, checked: false }]);
    setNewItem("");
  };

  const toggleItem = (id: string) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clearChecked = () => setItems((prev) => prev.filter((i) => !i.checked));

  const grouped = categories.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  const checked = items.filter((i) => i.checked).length;

  return (
    <div className="space-y-6">
      {/* Add Item */}
      <Card className="border-0">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input placeholder="Add item..." value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} className="flex-1" />
            <Button onClick={addItem} size="icon" className="rounded-xl shrink-0"><Plus size={16} /></Button>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {categories.map((cat) => (
              <Button key={cat} size="sm" variant={newCategory === cat ? "default" : "outline"} onClick={() => setNewCategory(cat)} className="rounded-full text-xs h-7">
                {cat}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {items.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <ShoppingCart size={14} className="inline mr-1" />
            {checked}/{items.length} items checked
          </p>
          {checked > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChecked} className="text-xs text-destructive">
              Clear checked
            </Button>
          )}
        </div>
      )}

      {/* Grouped Items */}
      <AnimatePresence>
        {grouped.map((group) => (
          <motion.div key={group.category} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-0">
              <CardHeader className="py-3">
                <CardTitle className="font-display text-sm flex items-center gap-2">
                  {group.category}
                  <Badge variant="secondary" className="text-xs">{group.items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-1.5">
                    <button onClick={() => toggleItem(item.id)} className="flex items-center gap-2 text-left flex-1">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${item.checked ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                        {item.checked && <Check size={12} className="text-primary-foreground" />}
                      </div>
                      <span className={`text-sm ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.name}</span>
                    </button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.id)}>
                      <Trash2 size={12} className="text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ShoppingCart size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Your shopping list is empty</p>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
