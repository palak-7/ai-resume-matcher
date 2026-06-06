# AI Resume Matcher

AI-powered resume analyser — match your resume against job descriptions using Groq LLaMA AI.
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=palak-7_ai-resume-matcher&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=palak-7_ai-resume-matcher)

[![CI Pipeline](https://github.com/YOUR_USERNAME/ai-resume-matcher/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/ai-resume-matcher/actions)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=YOUR_USERNAME_ai-resume-matcher&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=YOUR_USERNAME_ai-resume-matcher)

## API Documentation

Interactive API docs available at: `http://localhost:5000/api/docs`

## Features

- PDF resume upload + text extraction
- AI skill gap analysis (Groq LLaMA 3.1)
- Match score with matched/missing skills
- AI bullet point rewriter
- Interview question predictor
- Cover letter generator
- Analysis history

## Tech Stack

**Frontend:** React · TypeScript · Tailwind CSS · Vite  
**Backend:** Node.js · Express · TypeScript  
**Database:** MongoDB Atlas  
**AI:** Groq API (LLaMA 3.1)  
**DevOps:** GitHub Actions CI/CD · SonarCloud

## Setup

\`\`\`bash

# Backend

cd server && npm install && npm run dev

# Frontend

cd client && npm install && npm run dev
\`\`\`

## Environment Variables

\`\`\`
MONGODB_URI=your_atlas_uri
JWT_SECRET=your_secret
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=optional
\`\`\`
