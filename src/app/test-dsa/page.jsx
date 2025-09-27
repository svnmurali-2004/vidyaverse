"use client";

import DsaSheet from "@/components/DsaSheet";

// Sample DSA problems for testing
const sampleProblems = [
  {
    title: "Arrays",
    description: "Problems related to arrays and their manipulations",
    problems: [
      {
        id: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
        topic: "Array, Hash Table",
        leetcodeUrl: "https://leetcode.com/problems/two-sum/",
        companies: ["Amazon", "Google", "Microsoft"],
        notes: "Classic array problem using hash map for O(n) solution",
      },
      {
        id: "best-time-stock",
        title: "Best Time to Buy and Sell Stock",
        difficulty: "Easy",
        topic: "Array, Dynamic Programming",
        leetcodeUrl:
          "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
        companies: ["Amazon", "Google"],
        notes: "Track minimum price and maximum profit",
      },
      {
        id: "container-water",
        title: "Container With Most Water",
        difficulty: "Medium",
        topic: "Array, Two Pointers",
        leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
        companies: ["Amazon", "Facebook"],
        notes: "Two pointer approach for optimal solution",
      },
    ],
  },
  {
    title: "Linked Lists",
    description: "Problems involving linked list operations",
    problems: [
      {
        id: "reverse-linked-list",
        title: "Reverse Linked List",
        difficulty: "Easy",
        topic: "Linked List",
        leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list/",
        companies: ["Amazon", "Microsoft", "Apple"],
        notes: "Can be solved iteratively or recursively",
      },
      {
        id: "merge-two-lists",
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        topic: "Linked List, Recursion",
        leetcodeUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
        companies: ["Amazon", "Google"],
        notes: "Compare nodes and link them in sorted order",
      },
    ],
  },
  {
    title: "Trees",
    description: "Binary tree and tree traversal problems",
    problems: [
      {
        id: "inorder-traversal",
        title: "Binary Tree Inorder Traversal",
        difficulty: "Easy",
        topic: "Tree, Depth-First Search",
        leetcodeUrl:
          "https://leetcode.com/problems/binary-tree-inorder-traversal/",
        companies: ["Amazon", "Microsoft"],
        notes: "Left -> Root -> Right traversal pattern",
      },
      {
        id: "max-depth",
        title: "Maximum Depth of Binary Tree",
        difficulty: "Easy",
        topic: "Tree, Depth-First Search, Breadth-First Search",
        leetcodeUrl:
          "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
        companies: ["Amazon", "Google", "Facebook"],
        notes: "Use recursion or level-order traversal",
      },
    ],
  },
];

export default function TestDsaPage() {
  // Create a mock lesson object that matches what the component expects
  // Using a valid MongoDB ObjectId format for testing
  const mockLesson = {
    _id: "507f1f77bcf86cd799439011", // Valid ObjectId format for testing
    title: "DSA Problems Sheet",
    description: "Practice data structures and algorithms problems",
    type: "dsa",
    dsaSheet: {
      categories: sampleProblems,
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">DSA Sheet Test Page</h1>
        <p className="text-gray-600 dark:text-gray-400">
          This is a test page to verify the DSA Sheet component functionality.
          Note: Progress saving is disabled in test mode.
        </p>
      </div>

      <DsaSheet
        lesson={mockLesson}
        onProgressUpdate={(completed, total) => {
          console.log(`Progress: ${completed}/${total} problems completed`);
        }}
      />
    </div>
  );
}
