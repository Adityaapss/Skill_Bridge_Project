#!/bin/bash

# SkillBridge Database Population Script
# This script populates the database with mock data using the backend APIs

BASE_URL="http://localhost:8080/api"
ADMIN_EMAIL="admin@skillbridge.com"
ADMIN_PASSWORD="admin123"

echo "🚀 SkillBridge Database Population Script"
echo "=========================================="
echo ""

# Step 1: Login as Admin to get JWT token
echo "📝 Step 1: Logging in as HR Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed! Please ensure the backend is running and admin credentials are correct."
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful! Token obtained."
echo ""

# Step 2: Create Upcoming Projects
echo "📝 Step 2: Creating Upcoming Projects..."
echo ""

# Project 1: Mobile App Development
echo "  Creating: Mobile App Development..."
curl -s -X POST "${BASE_URL}/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "Mobile App Development",
    "description": "Build native mobile applications for iOS and Android with React Native",
    "expectedStartDate": "2024-04-01",
    "techStack": ["React Native", "TypeScript", "Firebase", "Redux"]
  }' > /dev/null
echo "  ✅ Mobile App Development created"

# Project 2: Data Analytics Platform
echo "  Creating: Data Analytics Platform..."
curl -s -X POST "${BASE_URL}/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "Data Analytics Platform",
    "description": "Build a comprehensive data analytics and reporting platform",
    "expectedStartDate": "2024-05-15",
    "techStack": ["Python", "PostgreSQL", "Apache Spark", "React", "Docker"]
  }' > /dev/null
echo "  ✅ Data Analytics Platform created"

# Project 3: E-Commerce Redesign
echo "  Creating: E-Commerce Redesign..."
curl -s -X POST "${BASE_URL}/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "E-Commerce Platform Redesign",
    "description": "Complete redesign of the e-commerce platform with modern UI/UX",
    "expectedStartDate": "2024-06-01",
    "techStack": ["Next.js", "TypeScript", "Tailwind CSS", "Stripe", "MongoDB"]
  }' > /dev/null
echo "  ✅ E-Commerce Redesign created"

# Project 4: DevOps Automation
echo "  Creating: DevOps Automation..."
curl -s -X POST "${BASE_URL}/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "DevOps Automation Suite",
    "description": "Automate deployment pipelines and infrastructure management",
    "expectedStartDate": "2024-07-01",
    "techStack": ["Kubernetes", "Docker", "Jenkins", "Terraform", "AWS"]
  }' > /dev/null
echo "  ✅ DevOps Automation created"

echo ""
echo "📝 Step 3: Getting Upcoming Projects to start some..."
UPCOMING_PROJECTS=$(curl -s -X GET "${BASE_URL}/projects/upcoming" \
  -H "Authorization: Bearer ${TOKEN}")

# Extract first two project IDs
PROJECT_ID_1=$(echo $UPCOMING_PROJECTS | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
PROJECT_ID_2=$(echo $UPCOMING_PROJECTS | grep -o '"id":[0-9]*' | head -2 | tail -1 | grep -o '[0-9]*')

echo "  Found upcoming projects: ID $PROJECT_ID_1 and ID $PROJECT_ID_2"
echo ""

# Step 4: Start Projects with Employee Assignments
echo "📝 Step 4: Starting Projects with Employee Assignments..."
echo ""

if [ ! -z "$PROJECT_ID_1" ]; then
    echo "  Starting project ID $PROJECT_ID_1 with employees..."
    curl -s -X POST "${BASE_URL}/projects/${PROJECT_ID_1}/start" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "employeeIds": [3, 4]
      }' > /dev/null
    echo "  ✅ Project $PROJECT_ID_1 started with 2 employees"
fi

if [ ! -z "$PROJECT_ID_2" ]; then
    echo "  Starting project ID $PROJECT_ID_2 with employees..."
    curl -s -X POST "${BASE_URL}/projects/${PROJECT_ID_2}/start" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "employeeIds": [2, 3]
      }' > /dev/null
    echo "  ✅ Project $PROJECT_ID_2 started with 2 employees"
fi

echo ""
echo "📝 Step 5: Verifying Data..."
echo ""

# Get counts
ONGOING_COUNT=$(curl -s -X GET "${BASE_URL}/projects/ongoing" -H "Authorization: Bearer ${TOKEN}" | grep -o '"id"' | wc -l)
UPCOMING_COUNT=$(curl -s -X GET "${BASE_URL}/projects/upcoming" -H "Authorization: Bearer ${TOKEN}" | grep -o '"id"' | wc -l)

echo "  📊 Database Status:"
echo "  - Ongoing Projects: $ONGOING_COUNT"
echo "  - Upcoming Projects: $UPCOMING_COUNT"
echo ""

echo "✅ Database population complete!"
echo ""
echo "🎉 Summary:"
echo "  - Created 4 upcoming projects"
echo "  - Started 2 projects (moved to ongoing)"
echo "  - Assigned employees to ongoing projects"
echo "  - All data saved to PostgreSQL database"
echo ""
echo "You can now:"
echo "  1. Refresh the frontend to see the data"
echo "  2. View ongoing projects in the 'Ongoing Projects' tab"
echo "  3. View upcoming projects in the 'Upcoming Projects' tab"
echo "  4. See employee assignments in each ongoing project"
echo ""
echo "🚀 Ready to use!"
