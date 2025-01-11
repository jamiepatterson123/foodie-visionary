import React from "react";
import { FoodItem } from "./FoodItem";

interface CategorySectionProps {
  category: string;
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
    category?: string;
    created_at?: string;
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  mealCategories: string[];
  showEmpty?: boolean;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  foods,
  onDelete,
  onUpdateCategory,
  mealCategories,
  showEmpty = false,
}) => {
  // Only render the section if there are foods in this category or showEmpty is true
  if (foods.length === 0 && !showEmpty) {
    return null;
  }

  const totalCalories = foods?.reduce(
    (total, food) => total + (food.nutrition?.calories || 0),
    0
  ) || 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/10">
        <span className="font-medium">{category}</span>
        <span className="text-sm">{totalCalories} kcal</span>
      </div>
      {foods.length > 0 && (
        <div className="space-y-2">
          {foods?.map((food) => (
            <FoodItem
              key={food.id}
              food={food}
              onDelete={onDelete}
              onUpdateCategory={onUpdateCategory}
              mealCategories={mealCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
};