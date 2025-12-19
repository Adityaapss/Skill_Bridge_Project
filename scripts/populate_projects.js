const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
const ADMIN_EMAIL = 'admin@skillbridge.com';
const ADMIN_PASSWORD = 'admin123';

let token = '';

// Helper function to make authenticated requests
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(config => {
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

async function login() {
    console.log('📝 Step 1: Logging in as HR Admin...');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        token = response.data.token;
        console.log('✅ Login successful!\n');
        return true;
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        return false;
    }
}

async function createProjects() {
    console.log('📝 Step 2: Creating Upcoming Projects...\n');

    const projects = [
        {
            name: 'Mobile App Development',
            description: 'Build native mobile applications for iOS and Android with React Native',
            expectedStartDate: '2024-04-01',
            techStack: ['React Native', 'TypeScript', 'Firebase', 'Redux']
        },
        {
            name: 'Data Analytics Platform',
            description: 'Build a comprehensive data analytics and reporting platform',
            expectedStartDate: '2024-05-15',
            techStack: ['Python', 'PostgreSQL', 'Apache Spark', 'React', 'Docker']
        },
        {
            name: 'E-Commerce Platform Redesign',
            description: 'Complete redesign of the e-commerce platform with modern UI/UX',
            expectedStartDate: '2024-06-01',
            techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Stripe', 'MongoDB']
        },
        {
            name: 'DevOps Automation Suite',
            description: 'Automate deployment pipelines and infrastructure management',
            expectedStartDate: '2024-07-01',
            techStack: ['Kubernetes', 'Docker', 'Jenkins', 'Terraform', 'AWS']
        }
    ];

    for (const project of projects) {
        try {
            await api.post('/projects', project);
            console.log(`  ✅ ${project.name} created`);
        } catch (error) {
            console.error(`  ❌ Failed to create ${project.name}:`, error.response?.data || error.message);
        }
    }
    console.log('');
}

async function startProjects() {
    console.log('📝 Step 3: Starting Some Projects with Employee Assignments...\n');

    try {
        // Get upcoming projects
        const response = await api.get('/projects/upcoming');
        const upcomingProjects = response.data;

        if (upcomingProjects.length >= 2) {
            // Start first project with employees 3 and 4
            const project1 = upcomingProjects[0];
            await api.post(`/projects/${project1.id}/start`, {
                employeeIds: [3, 4]
            });
            console.log(`  ✅ Started "${project1.name}" with 2 employees (John Doe, Jane Smith)`);

            // Start second project with employees 2 and 3
            const project2 = upcomingProjects[1];
            await api.post(`/projects/${project2.id}/start`, {
                employeeIds: [2, 3]
            });
            console.log(`  ✅ Started "${project2.name}" with 2 employees (Alice Manager, John Doe)`);
        }
    } catch (error) {
        console.error('  ❌ Failed to start projects:', error.response?.data || error.message);
    }
    console.log('');
}

async function verifyData() {
    console.log('📝 Step 4: Verifying Data...\n');

    try {
        const ongoingResponse = await api.get('/projects/ongoing');
        const upcomingResponse = await api.get('/projects/upcoming');

        console.log('  📊 Database Status:');
        console.log(`  - Ongoing Projects: ${ongoingResponse.data.length}`);
        console.log(`  - Upcoming Projects: ${upcomingResponse.data.length}`);
        console.log('');

        if (ongoingResponse.data.length > 0) {
            console.log('  📋 Ongoing Projects:');
            ongoingResponse.data.forEach(project => {
                const employeeCount = project.assignedEmployees?.length || 0;
                console.log(`    - ${project.name} (${employeeCount} employees assigned)`);
            });
            console.log('');
        }

        if (upcomingResponse.data.length > 0) {
            console.log('  📅 Upcoming Projects:');
            upcomingResponse.data.forEach(project => {
                console.log(`    - ${project.name} (Expected: ${project.expectedStartDate})`);
            });
            console.log('');
        }
    } catch (error) {
        console.error('  ❌ Failed to verify data:', error.response?.data || error.message);
    }
}

async function main() {
    console.log('🚀 SkillBridge Database Population Script');
    console.log('==========================================\n');

    const loggedIn = await login();
    if (!loggedIn) {
        console.log('\n❌ Script failed. Please ensure the backend is running.');
        process.exit(1);
    }

    await createProjects();
    await startProjects();
    await verifyData();

    console.log('✅ Database population complete!\n');
    console.log('🎉 Summary:');
    console.log('  - Created 4 upcoming projects');
    console.log('  - Started 2 projects (moved to ongoing)');
    console.log('  - Assigned employees to ongoing projects');
    console.log('  - All data saved to PostgreSQL database\n');
    console.log('You can now:');
    console.log('  1. Refresh the frontend to see the data');
    console.log('  2. View ongoing projects in the "Ongoing Projects" tab');
    console.log('  3. View upcoming projects in the "Upcoming Projects" tab');
    console.log('  4. See employee assignments in each ongoing project\n');
    console.log('🚀 Ready to use!');
}

main().catch(error => {
    console.error('\n❌ Script error:', error.message);
    process.exit(1);
});
