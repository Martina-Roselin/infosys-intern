# How to Run the ServiceFinder Application

## Prerequisites

1. **Java 17** ✅ (Already installed)
2. **MySQL Database** - Make sure MySQL is running on your system
3. **Maven** (or use the included Maven wrapper)

## Step-by-Step Instructions

### 1. Start MySQL Database

Make sure MySQL is running on your system:
- MySQL should be running on `localhost:3306`
- The database `service_provide` will be created automatically if it doesn't exist
- Default credentials in `application.properties`:
  - Username: `root`
  - Password: `martina2004`

### 2. Run the Application

You have **3 options** to run the application:

#### Option A: Using Maven Wrapper (Recommended - No Maven installation needed)
```bash
# On Windows (PowerShell or Command Prompt)
.\mvnw.cmd spring-boot:run

# Or if you're in Git Bash
./mvnw spring-boot:run
```

#### Option B: Using Maven (if installed)
```bash
mvn spring-boot:run
```

#### Option C: Run the JAR file directly
```bash
# First, build the JAR
.\mvnw.cmd clean package

# Then run it
java -jar target\servicefinder-0.0.1-SNAPSHOT.jar
```

### 3. Verify the Application is Running

Once started, you should see:
- Application running on: **http://localhost:8080**
- Look for: `Started InfosysInternshipApplication in X.XXX seconds`

### 4. Test the API

You can test if the server is running by:
- Opening browser: http://localhost:8080
- Or use Postman/curl to test endpoints

## Common Issues & Solutions

### Issue: Port 8080 already in use
**Solution:** Change the port in `application.properties`:
```
server.port=8081
```

### Issue: MySQL connection error
**Solution:** 
- Make sure MySQL is running
- Check MySQL username/password in `application.properties`
- Verify MySQL is on port 3306

### Issue: Email not working
**Solution:**
- Verify Gmail app password in `application.properties`
- Make sure 2-factor authentication is enabled on the Gmail account
- Generate a new app password if needed

## Stopping the Application

Press `Ctrl + C` in the terminal to stop the application.


