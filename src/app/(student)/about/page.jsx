"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Heart, Globe, Award, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 transform opacity-30">
          <div className="h-64 w-64 rounded-full bg-blue-400 blur-3xl filter"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 transform opacity-30">
          <div className="h-64 w-64 rounded-full bg-indigo-400 blur-3xl filter"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-blue-200 bg-blue-50 text-blue-700 px-4 py-1">
              Our Story
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
              Empowering the World Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Education</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              We're on a mission to make world-class education accessible to everyone, everywhere.
              Join us in shaping the future of learning.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Our Mission",
                desc: "To provide high-quality, affordable education that empowers individuals to achieve their career goals.",
                color: "bg-blue-100 text-blue-600"
              },
              {
                icon: Globe,
                title: "Our Vision",
                desc: "A world where anyone, anywhere can transform their life through learning and skill development.",
                color: "bg-indigo-100 text-indigo-600"
              },
              {
                icon: Heart,
                title: "Our Values",
                desc: "We believe in accessibility, quality, community, and continuous innovation in everything we do.",
                color: "bg-purple-100 text-purple-600"
              }
            ].map((item, index) => (
              <Card key={index} className="border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Students", value: "25k+" },
              { label: "Courses", value: "500+" },
              { label: "Instructors", value: "150+" },
              { label: "Countries", value: "120+" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-blue-400">{stat.value}</div>
                <div className="text-slate-400 font-medium uppercase tracking-wide text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-slate-600">
              We are a diverse team of educators, engineers, and designers passionate about the future of learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group">
                <div className="aspect-square bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="font-medium">Connect on LinkedIn</p>
                    </div>
                  </div>
                  {/* Placeholder for team member image */}
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                    <Users className="w-12 h-12" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Team Member {i}</h3>
                <p className="text-blue-600 font-medium">Position Title</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Join our community today and take the first step towards your new career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-lg shadow-lg shadow-blue-200">
                Explore Courses
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 px-8 h-12 text-lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
