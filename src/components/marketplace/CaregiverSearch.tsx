import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

interface CaregiverSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  query: string;
  specialty: string;
  maxRate: string;
  minRating: string;
}

const specialties = ["All", "Infant Care", "Toddler Care", "Special Needs", "Tutoring", "Night Care", "Meal Prep", "Homework Help"];

const CaregiverSearch = ({ onSearch }: CaregiverSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({ query: "", specialty: "All", maxRate: "", minRating: "" });
  const [showFilters, setShowFilters] = useState(false);

  const update = (key: keyof SearchFilters, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onSearch(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search caregivers..."
            className="pl-9"
            value={filters.query}
            onChange={(e) => update("query", e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={16} />
        </Button>
      </div>
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/50">
          <Select value={filters.specialty} onValueChange={(v) => update("specialty", v)}>
            <SelectTrigger><SelectValue placeholder="Specialty" /></SelectTrigger>
            <SelectContent>
              {specialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Max hourly rate" type="number" value={filters.maxRate} onChange={(e) => update("maxRate", e.target.value)} />
          <Select value={filters.minRating} onValueChange={(v) => update("minRating", v)}>
            <SelectTrigger><SelectValue placeholder="Min rating" /></SelectTrigger>
            <SelectContent>
              {["Any", "3+", "4+", "4.5+"].map((r) => <SelectItem key={r} value={r}>{r} stars</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CaregiverSearch;
