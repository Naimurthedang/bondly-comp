import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Plus, Trash2 } from "lucide-react";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];

const MealPlanner = () => {
  const [meals, setMeals] = useState<Record<string, Record<string, string>>>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const setMeal = (day: string, meal: string, value: string) => {
    setMeals((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: value },
    }));
    setEditingCell(null);
    setEditValue("");
  };

  const startEdit = (day: string, meal: string) => {
    setEditingCell(`${day}-${meal}`);
    setEditValue(meals[day]?.[meal] || "");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <UtensilsCrossed size={20} className="text-primary" />
        <h2 className="font-display text-xl font-bold text-foreground">Meal Planner</h2>
      </div>

      <div className="space-y-3">
        {daysOfWeek.map((day) => (
          <Card key={day} className="border-0">
            <CardHeader className="py-3">
              <CardTitle className="font-display text-sm">{day}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {mealTypes.map((meal) => {
                  const cellKey = `${day}-${meal}`;
                  const value = meals[day]?.[meal];

                  return editingCell === cellKey ? (
                    <Input
                      key={cellKey}
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => setMeal(day, meal, editValue)}
                      onKeyDown={(e) => e.key === "Enter" && setMeal(day, meal, editValue)}
                      placeholder={meal}
                      className="text-xs h-9"
                    />
                  ) : (
                    <Button
                      key={cellKey}
                      variant="outline"
                      className="h-auto min-h-[36px] text-xs justify-start px-3 py-2"
                      onClick={() => startEdit(day, meal)}
                    >
                      {value ? (
                        <span className="truncate">{value}</span>
                      ) : (
                        <span className="text-muted-foreground">{meal}</span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealPlanner;
