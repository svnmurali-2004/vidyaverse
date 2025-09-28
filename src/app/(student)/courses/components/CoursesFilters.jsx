"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter, SlidersHorizontal, Check } from "lucide-react";
import { useState, useEffect } from "react";

const categories = [
  "all",
  "Programming",
  "Web Development",
  "Mobile Development", 
  "Data Science",
  "Machine Learning",
  "AI",
  "Database",
  "DevOps",
  "Cybersecurity",
  "UI/UX Design",
  "Digital Marketing",
  "Business",
  "Other"
];

const levels = ["all", "beginner", "intermediate", "advanced"];
const sortOptions = [
  { value: "createdAt", label: "Latest" },
  { value: "-createdAt", label: "Oldest" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-avgRating", label: "Highest Rated" },
  { value: "-enrollmentCount", label: "Most Popular" },
  { value: "title", label: "A-Z" },
  { value: "-title", label: "Z-A" }
];

export default function CoursesFilters({
  searchTerm,
  categoryFilter,
  levelFilter,
  sortBy,
  priceFilter,
  onSearchChange,
  onCategoryChange,
  onLevelChange,
  onSortChange,
  onPriceFilterChange,
  onClearFilters
}) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFiltersCount = [
    categoryFilter !== "all" ? 1 : 0,
    levelFilter !== "all" ? 1 : 0,
    priceFilter !== "all" ? 1 : 0,
    searchTerm ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const hasActiveFilters = activeFiltersCount > 0;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileFilters]);

  const closeMobileFilters = () => {
    setShowMobileFilters(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar - Always Visible */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search courses, skills, or topics..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-12 text-base"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Mobile Filter Popup */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileFilters}
          />
          
          {/* Modal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-xl shadow-xl max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMobileFilters}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {/* Category Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={categoryFilter === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => onCategoryChange(category)}
                      className="justify-start text-left h-10"
                    >
                      {categoryFilter === category && (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      {category === "all" ? "All Categories" : category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {levels.map((level) => (
                    <Button
                      key={level}
                      variant={levelFilter === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => onLevelChange(level)}
                      className="justify-start text-left h-10 capitalize"
                    >
                      {levelFilter === level && (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      {level === "all" ? "All Levels" : level}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price
                </label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Prices" },
                    { value: "free", label: "Free Only" },
                    { value: "paid", label: "Paid Only" }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={priceFilter === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPriceFilterChange(option.value)}
                      className="w-full justify-start text-left h-10"
                    >
                      {priceFilter === option.value && (
                        <Check className="h-3 w-3 mr-2" />
                      )}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort By
                </label>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSortChange(option.value)}
                      className="w-full justify-start text-left h-10"
                    >
                      {sortBy === option.value && (
                        <Check className="h-3 w-3 mr-2" />
                      )}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onClearFilters();
                    closeMobileFilters();
                  }}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Clear All
                </Button>
              )}
              <Button
                onClick={closeMobileFilters}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filters - Always Visible on Large Screens */}
      <div className="hidden lg:block space-y-4">
        {/* Filter Controls */}
        <div className="flex flex-row gap-4 items-center">
          {/* Category Filter */}
          <div className="flex-1 max-w-xs">
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Filter */}
          <div className="flex-1 max-w-xs">
            <Select value={levelFilter} onValueChange={onLevelChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Filter */}
          <div className="flex-1 max-w-xs">
            <Select value={priceFilter} onValueChange={onPriceFilterChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free Only</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div className="flex-1 max-w-xs">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters - Desktop */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-muted-foreground py-1">Active filters:</span>
            
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchTerm}"
                <button
                  onClick={() => onSearchChange("")}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {categoryFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {categoryFilter}
                <button
                  onClick={() => onCategoryChange("all")}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {levelFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Level: {levelFilter.charAt(0).toUpperCase() + levelFilter.slice(1)}
                <button
                  onClick={() => onLevelChange("all")}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {priceFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {priceFilter === "free" ? "Free courses" : "Paid courses"}
                <button
                  onClick={() => onPriceFilterChange("all")}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}