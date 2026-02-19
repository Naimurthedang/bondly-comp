import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Phone, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

const EmergencyContacts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", phone: "", relationship: "" });

  const { data: contacts = [] } = useQuery({
    queryKey: ["emergency-contacts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("parent_id", user!.id)
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addContact = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("emergency_contacts").insert({
        parent_id: user!.id,
        ...form,
        is_primary: contacts.length === 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contact added");
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
      setForm({ name: "", phone: "", relationship: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contact removed");
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
    },
  });

  return (
    <Card className="border-0 bg-card">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Phone size={18} className="text-primary" /> Emergency Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div>
              <p className="font-medium text-foreground">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.phone} • {c.relationship}</p>
            </div>
            <div className="flex items-center gap-2">
              {c.is_primary && <span className="text-xs text-primary font-medium">Primary</span>}
              <Button variant="ghost" size="icon" onClick={() => deleteContact.mutate(c.id)}>
                <Trash2 size={14} className="text-destructive" />
              </Button>
            </div>
          </div>
        ))}

        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <UserPlus size={14} /> Add Contact
          </p>
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="Relationship" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
          <Button
            onClick={() => addContact.mutate()}
            disabled={!form.name || !form.phone || !form.relationship || addContact.isPending}
            className="w-full gap-2"
          >
            <Plus size={16} /> Add Emergency Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyContacts;
