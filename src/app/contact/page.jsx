"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  Users,
  BookOpen,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "support@vidyaverse.com",
      link: "mailto:support@vidyaverse.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: MapPin,
      label: "Address",
      value: "123 Learning Street, Education City, EC 12345",
      link: "https://maps.google.com",
    },
    {
      icon: Clock,
      label: "Business Hours",
      value: "Monday - Friday: 9AM - 6PM PST",
      link: null,
    },
  ];

  const inquiryTypes = [
    {
      value: "general",
      label: "General Inquiry",
      icon: MessageSquare,
      description: "General questions about VidyaVerse",
    },
    {
      value: "support",
      label: "Technical Support",
      icon: HelpCircle,
      description: "Help with technical issues or bugs",
    },
    {
      value: "course",
      label: "Course Inquiry",
      icon: BookOpen,
      description: "Questions about specific courses",
    },
    {
      value: "partnership",
      label: "Partnership",
      icon: Users,
      description: "Business partnerships and collaborations",
    },
  ];

  const faqs = [
    {
      question: "How do I enroll in a course?",
      answer:
        "You can enroll in any course by creating an account, browsing our course catalog, and clicking the 'Enroll Now' button on your desired course.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 30-day money-back guarantee for all paid courses. If you're not satisfied, contact us for a full refund.",
    },
    {
      question: "Can I access courses on mobile devices?",
      answer:
        "Absolutely! VidyaVerse is fully responsive and works on all devices. You can also install our PWA for a native app experience.",
    },
    {
      question: "Do you provide certificates?",
      answer:
        "Yes, you'll receive a certificate of completion for each course you finish. These certificates can be shared on LinkedIn and other platforms.",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        "Message sent successfully! We'll get back to you within 24 hours."
      );
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        type: "general",
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Contact Us
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                We'd love to hear from you. Send us a message and we'll respond
                as soon as possible.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2 text-blue-600" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      What can we help you with?
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {inquiryTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              type: type.value,
                            }))
                          }
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            formData.type === type.value
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <type.icon className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">
                                {type.label}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Reach out to us through any of these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <info.icon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {info.label}
                      </div>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {info.value}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Quick Response
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We typically respond to all inquiries within 24 hours during
                    business days.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/student/dashboard">
                  <Button variant="ghost" className="w-full justify-start">
                    Student Dashboard
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="ghost" className="w-full justify-start">
                    Browse Courses
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="ghost" className="w-full justify-start">
                    About Us
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Can't find what you're looking for? Check out these common
              questions and answers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Still have questions?
            </p>
            <Button variant="outline">View Full FAQ</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
