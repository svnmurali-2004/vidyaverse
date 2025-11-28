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
import { Search, X, Filter, SlidersHorizontal, Check, ArrowUpDown } from "lucide-react";
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
    <div className="space-y-6">
      {/* Search Bar - Always Visible */}
      <div className="relative max-w-2xl mx-auto">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            type="text"
            placeholder="Search for courses, skills, or topics..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 pr-12 h-14 text-base rounded-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md focus:shadow-lg focus:border-blue-500 transition-all duration-300 bg-white dark:bg-slate-900"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4 text-slate-500" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 rounded-full border-slate-300"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-600 text-white rounded-full">
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
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-600 text-white rounded-full">
                    {activeFiltersCount}
                  </Badge>
                )}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileFilters}
                className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 overflow-y-auto flex-1">
              {/* Category Filter */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={categoryFilter === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => onCategoryChange(category)}
                      className={`justify-start text-left h-auto py-2 px-3 ${categoryFilter === category
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                    >
                      {categoryFilter === category && (
                        <Check className="h-3 w-3 mr-2 flex-shrink-0" />
                      )}
                      <span className="truncate">{category === "all" ? "All Categories" : category}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {levels.map((level) => (
                    <Button
                      key={level}
                      variant={levelFilter === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => onLevelChange(level)}
                      className={`justify-start text-left h-auto py-2 px-3 capitalize ${levelFilter === level
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                    >
                      {levelFilter === level && (
                        <Check className="h-3 w-3 mr-2 flex-shrink-0" />
                      )}
                      {level === "all" ? "All Levels" : level}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
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
                      className={`w-full justify-start text-left h-10 ${priceFilter === option.value
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
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
                <label className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Sort By
                </label>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSortChange(option.value)}
                      className={`w-full justify-start text-left h-10 ${sortBy === option.value
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
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
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-900/50">
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              >
                Show Results
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filters - Always Visible on Large Screens */}
      <div className="hidden lg:block space-y-4">
        {/* Filter Controls */}
        <div className="flex flex-row gap-4 items-center justify-center">
          {/* Category Filter */}
          <div className="w-48">
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:border-blue-400 transition-colors">
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
          <div className="w-40">
            <Select value={levelFilter} onValueChange={onLevelChange}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:border-blue-400 transition-colors">
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
          <div className="w-40">
            <Select value={priceFilter} onValueChange={onPriceFilterChange}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:border-blue-400 transition-colors">
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
          <div className="w-48">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Sort by" />
                </div>
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
              onClick={onClearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl px-4 h-11"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap justify-center gap-2 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {searchTerm && (
              <Badge variant="secondary" className="pl-3 pr-1 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-2">
                Search: "{searchTerm}"
                <button
                  onClick={() => onSearchChange("")}
                  className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {categoryFilter !== "all" && (
              <Badge variant="secondary" className="pl-3 pr-1 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-2">
                Category: {categoryFilter}
                <button
                  onClick={() => onCategoryChange("all")}
                  className="p-0.5 hover:bg-indigo-200 rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {levelFilter !== "all" && (
              <Badge variant="secondary" className="pl-3 pr-1 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-2">
                Level: {levelFilter.charAt(0).toUpperCase() + levelFilter.slice(1)}
                <button
                  onClick={() => onLevelChange("all")}
                  className="p-0.5 hover:bg-purple-200 rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {priceFilter !== "all" && (
              <Badge variant="secondary" className="pl-3 pr-1 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100 flex items-center gap-2">
                {priceFilter === "free" ? "Free courses" : "Paid courses"}
                <button
                  onClick={() => onPriceFilterChange("all")}
                  className="p-0.5 hover:bg-green-200 rounded-full transition-colors"
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