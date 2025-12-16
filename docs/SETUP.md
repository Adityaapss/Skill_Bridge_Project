# Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Java Development Kit (JDK)**: Version 17 or higher
  - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use [OpenJDK](https://openjdk.org/)
  - Verify: `java -version`
  
- **Maven**: Version 3.8 or higher
  - Download from [Apache Maven](https://maven.apache.org/download.cgi)
  - Verify: `mvn -version`
  
- **Node.js**: Version 18 or higher
  - Download from [Node.js](https://nodejs.org/)
  - Verify: `node -v` and `npm -v`
  
- **PostgreSQL**: Version 15 or higher
  - Download from [PostgreSQL](https://www.postgresql.org/download/)
  - Verify: `psql --version`

### Optional Tools
- **Git**: For version control
- **Postman**: For API testing
- **IntelliJ IDEA** or **VS Code**: Recommended IDEs

---

## Database Setup

### 1. Install PostgreSQL

Follow the installation instructions for your operating system from the [PostgreSQL website](https://www.postgresql.org/download/).

### 2. Create Database

Open PostgreSQL command line or use a GUI tool like pgAdmin:

```sql
-- Create database
CREATE DATABASE skillbridge;

-- Create user (optional, for production)
CREATE USER skillbridge_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE skillbridge TO skillbridge_user;
```

### 3. Verify Connection

```bash
psql -U postgres -d skillbridge
```

---

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Configure Database Connection

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/skillbridge
spring.datasource.username=postgres
spring.datasource.password=your_password

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
jwt.secret=your-256-bit-secret-key-change-this-in-production
jwt.expiration=86400000

# Server Configuration
server.port=8080
```

**Important**: 
- Change `your_password` to your PostgreSQL password
- Generate a secure JWT secret for production (use a random 256-bit key)

### 3. Install Dependencies

```bash
mvn clean install
```

This will download all required dependencies defined in `pom.xml`.

### 4. Run the Application

```bash
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`.

### 5. Verify Backend is Running

Open your browser or use curl:

```bash
curl http://localhost:8080/api/health
```

You should see a response indicating the server is running.

### 6. Access Swagger UI

Once running, access the API documentation at:

```
http://localhost:8080/swagger-ui.html
```

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all packages defined in `package.json`.

### 3. Configure API Endpoint

The frontend is pre-configured to connect to `http://localhost:8080`. If you need to change this, edit `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

### 4. Run Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`.

### 5. Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

---

## Seed Data

The application includes seed data for testing purposes.

### Automatic Seeding

When you first run the backend with `spring.jpa.hibernate.ddl-auto=update`, the application will automatically create tables. To load seed data:

**Option 1: SQL Script**

Run the seed data script:

```bash
psql -U postgres -d skillbridge -f src/main/resources/data.sql
```

**Option 2: Spring Boot Data Loader**

The application includes a `DataLoader` component that runs on startup and creates sample data if the database is empty.

### Sample Users

After seeding, you can log in with these credentials:

| Role | Email | Password |
|------|-------|----------|
| HR Admin | admin@skillbridge.com | admin123 |
| Manager | manager@skillbridge.com | manager123 |
| Employee | employee@skillbridge.com | employee123 |

**Important**: Change these passwords in production!

---

## Running Both Backend and Frontend

### Terminal 1 - Backend
```bash
cd backend
mvn spring-boot:run
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

---

## Building for Production

### Backend

Create a production JAR:

```bash
cd backend
mvn clean package -DskipTests
```

The JAR file will be in `target/skillbridge-0.0.1-SNAPSHOT.jar`.

Run the JAR:

```bash
java -jar target/skillbridge-0.0.1-SNAPSHOT.jar
```

### Frontend

Build the production bundle:

```bash
cd frontend
npm run build
```

The production files will be in the `dist/` directory. You can serve them with any static file server:

```bash
npm run preview
```

Or deploy to a hosting service like Netlify, Vercel, or AWS S3.

---

## Environment Variables

For production, use environment variables instead of hardcoding values:

### Backend (.env or system environment)

```bash
export DB_URL=jdbc:postgresql://localhost:5432/skillbridge
export DB_USERNAME=skillbridge_user
export DB_PASSWORD=secure_password
export JWT_SECRET=your-secure-256-bit-secret
export JWT_EXPIRATION=86400000
```

Update `application.properties` to use these:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION}
```

### Frontend (.env)

Create a `.env` file in the frontend directory:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

Update `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

---

## Troubleshooting

### Backend Issues

**Problem**: `Could not connect to database`
- **Solution**: Verify PostgreSQL is running and credentials are correct
- Check: `psql -U postgres -d skillbridge`

**Problem**: `Port 8080 already in use`
- **Solution**: Change the port in `application.properties`:
  ```properties
  server.port=8081
  ```

**Problem**: `Maven build fails`
- **Solution**: Ensure Java 17+ is installed: `java -version`
- Clear Maven cache: `mvn clean`

### Frontend Issues

**Problem**: `Cannot connect to backend`
- **Solution**: Verify backend is running on `http://localhost:8080`
- Check CORS configuration in backend

**Problem**: `npm install fails`
- **Solution**: Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then reinstall

**Problem**: `Port 5173 already in use`
- **Solution**: Kill the process or change the port in `vite.config.js`:
  ```javascript
  export default defineConfig({
    server: {
      port: 5174
    }
  })
  ```

### Database Issues

**Problem**: `Database does not exist`
- **Solution**: Create the database:
  ```sql
  CREATE DATABASE skillbridge;
  ```

**Problem**: `Permission denied`
- **Solution**: Grant privileges:
  ```sql
  GRANT ALL PRIVILEGES ON DATABASE skillbridge TO postgres;
  ```

---

## Testing

### Backend Tests

Run all tests:

```bash
cd backend
mvn test
```

Run specific test class:

```bash
mvn test -Dtest=EmployeeServiceTest
```

### Frontend Tests

Run all tests:

```bash
cd frontend
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

---

## Next Steps

1. ✅ Verify both backend and frontend are running
2. ✅ Log in with sample credentials
3. ✅ Explore the application features
4. ✅ Review the API documentation at `/swagger-ui.html`
5. ✅ Check the [API.md](./API.md) for detailed endpoint documentation

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the [README.md](../README.md) for architecture overview
3. Contact the development team

---

**Happy coding! 🚀**
