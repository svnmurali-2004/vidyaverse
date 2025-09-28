"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Copy, Eye, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: "",
    maxDiscount: "",
    minOrderValue: "",
    applicableTo: "all",
    courses: [],
    categories: [],
    usageLimit: "",
    userLimit: "1",
    validFrom: "",
    validUntil: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (session?.user) {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [couponsRes, coursesRes] = await Promise.all([
        fetch("/api/coupons"),
        fetch("/api/courses?limit=100"),
      ]);

      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCoupons(couponsData.data || []);
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      type: "percentage",
      value: "",
      maxDiscount: "",
      minOrderValue: "",
      applicableTo: "all",
      courses: [],
      categories: [],
      usageLimit: "",
      userLimit: "1",
      validFrom: "",
      validUntil: "",
    });
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingCoupon ? "PUT" : "POST";
      const url = editingCoupon ? `/api/coupons/${editingCoupon._id}` : "/api/coupons";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          userLimit: parseInt(formData.userLimit),
        }),
      });

      if (response.ok) {
        toast.success(`Coupon ${editingCoupon ? "updated" : "created"} successfully`);
        setShowCreateModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save coupon");
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error("Failed to save coupon");
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || "",
      minOrderValue: coupon.minOrderValue?.toString() || "",
      applicableTo: coupon.applicableTo,
      courses: coupon.courses?.map(c => c._id) || [],
      categories: coupon.categories || [],
      usageLimit: coupon.usageLimit?.toString() || "",
      userLimit: coupon.userLimit?.toString() || "1",
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : "",
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : "",
    });
    setShowCreateModal(true);
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied to clipboard");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    } else if (now < validFrom) {
      return <Badge variant="outline">Scheduled</Badge>;
    } else if (now > validUntil) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <p className="text-gray-600">Create and manage discount coupons</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </DialogTitle>
              <DialogDescription>
                {editingCoupon ? "Update the coupon details" : "Create a new discount coupon for your courses"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Get 20% off on all courses"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">
                    {formData.type === "percentage" ? "Percentage (%)" : "Amount (₹)"} *
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    min="0"
                    max={formData.type === "percentage" ? "100" : undefined}
                    step={formData.type === "percentage" ? "1" : "0.01"}
                    required
                  />
                </div>
                {formData.type === "percentage" && (
                  <div>
                    <Label htmlFor="maxDiscount">Max Discount (₹)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="minOrderValue">Minimum Order Value (₹)</Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom">Valid From *</Label>
                  <Input
                    id="validFrom"
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <Input
                    id="validUntil"
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    min="1"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <Label htmlFor="userLimit">Per User Limit *</Label>
                  <Input
                    id="userLimit"
                    type="number"
                    value={formData.userLimit}
                    onChange={(e) => setFormData({ ...formData, userLimit: e.target.value })}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCoupon ? "Update" : "Create"} Coupon
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>
            Manage your discount coupons and track their usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-medium">{coupon.code}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCouponCode(coupon.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {coupon.type === "percentage" ? "%" : "₹"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.type === "percentage" 
                      ? `${coupon.value}%`
                      : `₹${coupon.value}`
                    }
                    {coupon.maxDiscount && (
                      <div className="text-sm text-gray-500">
                        Max: ₹{coupon.maxDiscount}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(coupon)}</TableCell>
                  <TableCell>
                    <span>{coupon.usedCount}</span>
                    {coupon.usageLimit && (
                      <span className="text-gray-500">/{coupon.usageLimit}</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(coupon.validUntil)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {coupons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No coupons found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Coupon
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}