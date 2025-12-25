import React from 'react';
import { Link } from 'react-router-dom';

const OurTeam = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Pratham Shah",
      position: "Founder & CEO",
      image: "/team/pratham.jpg",
      bio: "Legal technology expert with over 8 years of experience in AI and legal systems. Passionate about making legal services accessible to everyone.",
      expertise: ["Legal Technology", "AI Development", "Business Strategy"],
      linkedin: "https://linkedin.com/in/pratham-shah",
      email: "pratham@salhakar.com"
    },
    {
      id: 2,
      name: "Dr. Anjali Mehta",
      position: "Chief Legal Officer",
      image: "/team/anjali.jpg",
      bio: "Senior legal counsel with expertise in Indian law and regulatory compliance. Former Supreme Court advocate with 12+ years of experience.",
      expertise: ["Indian Law", "Regulatory Compliance", "Legal Research"],
      linkedin: "https://linkedin.com/in/anjali-mehta",
      email: "anjali@salhakar.com"
    },
    {
      id: 3,
      name: "Rajesh Kumar",
      position: "Head of Technology",
      image: "/team/rajesh.jpg",
      bio: "Full-stack developer and AI specialist with expertise in natural language processing and legal document analysis.",
      expertise: ["AI/ML", "Full-Stack Development", "NLP"],
      linkedin: "https://linkedin.com/in/rajesh-kumar",
      email: "rajesh@salhakar.com"
    },
    {
      id: 4,
      name: "Priya Sharma",
      position: "Head of Product",
      image: "/team/priya.jpg",
      bio: "Product strategist with a background in legal tech and user experience design. Focused on creating intuitive legal solutions.",
      expertise: ["Product Strategy", "UX Design", "Legal Tech"],
      linkedin: "https://linkedin.com/in/priya-sharma",
      email: "priya@salhakar.com"
    },
    {
      id: 5,
      name: "Amit Patel",
      position: "Senior Legal Researcher",
      image: "/team/amit.jpg",
      bio: "Legal research specialist with deep knowledge of case law and legal precedents. Expert in legal document analysis and research methodologies.",
      expertise: ["Legal Research", "Case Law Analysis", "Document Review"],
      linkedin: "https://linkedin.com/in/amit-patel",
      email: "amit@salhakar.com"
    },
    {
      id: 6,
      name: "Sneha Reddy",
      position: "Head of Operations",
      image: "/team/sneha.jpg",
      bio: "Operations expert with experience in scaling legal tech startups. Focused on process optimization and team coordination.",
      expertise: ["Operations", "Process Optimization", "Team Management"],
      linkedin: "https://linkedin.com/in/sneha-reddy",
      email: "sneha@salhakar.com"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the passionate individuals behind सलहाकार, dedicated to revolutionizing legal services through technology and innovation.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Profile Image */}
              <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{member.position}</p>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {member.bio}
                </p>

                {/* Expertise Tags */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Expertise:</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Links */}
                <div className="flex space-x-3">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center justify-center w-8 h-8 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              We believe that legal services should be accessible, affordable, and efficient for everyone. 
              Our team combines deep legal expertise with cutting-edge technology to create innovative 
              solutions that democratize access to justice.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessibility</h3>
              <p className="text-gray-600">
                Making legal services accessible to everyone, regardless of their location or financial situation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                Leveraging AI and technology to revolutionize how legal services are delivered and consumed.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                Committed to delivering the highest quality legal solutions with attention to detail and accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Us Section */}
      < div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Team</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            We're always looking for talented individuals who share our passion for making legal services 
            more accessible and efficient. Join us in building the future of legal technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:careers@salhakar.com"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              View Open Positions
            </a>
            <a
              href="mailto:hello@salhakar.com"
              className="inline-flex items-center px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurTeam;
