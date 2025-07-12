"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Target,
  Heart,
  Globe,
  Lightbulb,
  Star,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  const stats = [
    { number: "10,000+", label: "Students", icon: Users },
    { number: "500+", label: "Courses", icon: BookOpen },
    { number: "50+", label: "Expert Instructors", icon: GraduationCap },
    { number: "95%", label: "Success Rate", icon: Award },
  ];

  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for the highest quality in education and learning experiences.",
    },
    {
      icon: Heart,
      title: "Accessibility",
      description: "Making quality education accessible to everyone, everywhere.",
    },
    {
      icon: Globe,
      title: "Innovation",
      description: "Embracing cutting-edge technology to enhance learning outcomes.",
    },
    {
      icon: Lightbulb,
      title: "Growth",
      description: "Fostering continuous learning and personal development.",
    },
  ];

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Founder & CEO",
      description: "Former Stanford professor with 15+ years in educational technology.",
      image: "/team/sarah.jpg",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      description: "Expert in AI and machine learning with a passion for education.",
      image: "/team/michael.jpg",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Content",
      description: "Curriculum designer with experience from top universities.",
      image: "/team/emily.jpg",
    },
    {
      name: "David Kim",
      role: "Head of Student Experience",
      description: "UX expert focused on creating engaging learning experiences.",
      image: "/team/david.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                About VidyaVerse
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Empowering learners worldwide through innovative education
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Mission Section */}
        <section className="text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              At VidyaVerse, we believe that quality education should be accessible to everyone, 
              everywhere. We're on a mission to democratize learning by providing world-class 
              educational content through innovative technology and engaging experiences.
            </p>
            <Badge variant="outline" className="text-lg px-6 py-2">
              "Vidya" means knowledge in Sanskrit
            </Badge>
          </div>
        </section>

        {/* Stats Section */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-4 text-blue-600" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Our Story
            </h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                VidyaVerse was born from a simple observation: traditional education 
                wasn't keeping pace with the rapidly changing world. Our founders, 
                a team of educators and technologists, saw an opportunity to bridge 
                this gap.
              </p>
              <p>
                Since our launch in 2020, we've grown from a small startup with 
                big dreams to a global platform serving learners in over 190 countries. 
                Our approach combines the best of traditional pedagogy with cutting-edge 
                technology to create learning experiences that are both effective and engaging.
              </p>
              <p>
                Today, we continue to innovate, adding new features like AI-powered 
                personalization, interactive assessments, and collaborative learning 
                tools that help our students achieve their goals faster than ever before.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <div className="text-center">
                <GraduationCap className="h-16 w-16 mx-auto mb-4" />
                <h4 className="text-2xl font-bold mb-2">Since 2020</h4>
                <p className="text-blue-100">
                  Transforming lives through education
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              These core principles guide everything we do at VidyaVerse
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <value.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section - Temporarily Hidden */}
        {false && (
        <section>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The passionate individuals behind VidyaVerse's success
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h4>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        )}

        {/* Call to Action */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-12">
              <Star className="h-16 w-16 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-4">
                Ready to Start Your Learning Journey?
              </h3>
              <p className="text-xl mb-8 text-blue-100">
                Join thousands of students who are already transforming their careers with VidyaVerse
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/courses">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Browse Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
