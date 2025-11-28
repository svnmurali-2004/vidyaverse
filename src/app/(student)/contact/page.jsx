"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, MapPin, Phone, Send, MessageSquare, Clock, HelpCircle, BookOpen, Users, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "", type: "general" });
    setIsSubmitting(false);
  };

  const inquiryTypes = [
    { value: "general", label: "General Inquiry", icon: MessageSquare },
    { value: "support", label: "Technical Support", icon: HelpCircle },
    { value: "course", label: "Course Inquiry", icon: BookOpen },
    { value: "partnership", label: "Partnership", icon: Users },
  ];

  const faqs = [
    {
      question: "How do I enroll in a course?",
      answer: "You can enroll in any course by creating an account, browsing our course catalog, and clicking the 'Enroll Now' button on your desired course.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for all paid courses. If you're not satisfied, contact us for a full refund.",
    },
    {
      question: "Can I access courses on mobile devices?",
      answer: "Absolutely! VidyaVerse is fully responsive and works on all devices. You can also install our PWA for a native app experience.",
    },
    {
      question: "Do you provide certificates?",
      answer: "Yes, you'll receive a certificate of completion for each course you finish. These certificates can be shared on LinkedIn and other platforms.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <main className="flex-grow pt-12 pb-16">
        {/* Header Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="container relative mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4" />
              <span>We'd love to hear from you</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Touch</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Have a question about our courses, pricing, or just want to say hello?
              Our team is ready to answer all your questions.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Mail className="w-5 h-5" />
                    </div>
                    Email Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-2">Our friendly team is here to help.</p>
                  <a href="mailto:support@vidyaverse.com" className="text-blue-600 font-medium hover:underline">
                    support@vidyaverse.com
                  </a>
                </CardContent>
              </Card>

              <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    Visit Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-2">Come say hello at our office headquarters.</p>
                  <p className="text-slate-900 font-medium">
                    123 Innovation Drive<br />
                    Tech Valley, CA 94043
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                      <Phone className="w-5 h-5" />
                    </div>
                    Call Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-2">Mon-Fri from 8am to 5pm.</p>
                  <a href="tel:+15550000000" className="text-blue-600 font-medium hover:underline">
                    +1 (555) 000-0000
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-6">
                  <div className="text-center">
                    <CheckCircle className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-semibold text-slate-900 mb-2">Quick Response</h3>
                    <p className="text-sm text-slate-600">
                      We typically respond to all inquiries within 24 hours during business days.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-slate-100 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Inquiry Type Selection */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {inquiryTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                          className={`p-3 rounded-xl border text-center transition-all ${formData.type === type.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                        >
                          <type.icon className={`w-5 h-5 mx-auto mb-2 ${formData.type === type.value ? "text-blue-600" : "text-slate-400"}`} />
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-700">
                          Full Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-slate-700">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-slate-700">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="bg-slate-50 border-slate-200 focus:bg-white transition-colors resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Can't find what you're looking for? Check out these common questions and answers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-slate-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-slate-900 mb-3 flex items-start">
                      <HelpCircle className="w-5 h-5 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                      {faq.question}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed pl-7">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
