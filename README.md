# SPARK – MERN Application with Docker and Jenkins CI/CD

## 📌 Project Overview

SPARK is a MERN-based web application designed for online quizzes and learning analytics.

This project demonstrates how DevOps tools such as Git, GitHub, Docker, and Jenkins can automate the application deployment process.

Git and GitHub are used for source code management, Docker is used to build and run the application inside a container, and Jenkins automates the build and deployment process.

The main goal is to reduce manual deployment work and make the deployment process simple, consistent, and repeatable.

## 🎯 Objectives

* To manage application source code using Git and GitHub.
* To containerize the SPARK application using Docker.
* To automate the build and deployment process using Jenkins.
* To understand the practical implementation of CI/CD.
* To improve deployment consistency and reduce manual errors.
* To understand how DevOps tools work together in a real-world project.

## 🛠️ Technologies Used

| Technology | Purpose                       |
| ---------- | ----------------------------- |
| MongoDB    | Database management           |
| Express.js | Backend API development       |
| React.js   | User interface development    |
| Node.js    | Backend runtime environment   |
| Git        | Version control               |
| GitHub     | Source code hosting           |
| Docker     | Application containerization  |
| Jenkins    | CI/CD automation              |
| PowerShell | Executing commands in Windows |

## ⚙️ Project Workflow

The project follows a simple CI/CD workflow:

1. **Code Development:** Develop and update the SPARK application.
2. **Version Control:** Use Git to track changes in the source code.
3. **GitHub Repository:** Push the code to GitHub.
4. **Docker Build:** Build a Docker image of the application.
5. **Containerization:** Run the application inside a Docker container.
6. **Jenkins Automation:** Configure Jenkins to automate the build and deployment steps.
7. **Application Verification:** Check whether the application is running correctly.

### Workflow Diagram

```text
      Developer
          |
          v
    Source Code
          |
          v
     Git & GitHub
          |
          v
    Jenkins Pipeline
          |
          v
     Docker Build
          |
          v
     Docker Image
          |
          v
   Docker Container
          |
          v
  Running SPARK App
```

## 🐳 Docker Implementation

Docker is used to package the application and its required dependencies into a container.

### Benefits of Docker

* Provides a consistent application environment.
* Simplifies application deployment.
* Reduces environment-related issues.
* Makes the application easier to run and manage.
* Improves portability across supported environments.

### Docker Commands

Build the Docker image:

```bash
docker build -t spark-app .
```

Run the application container:

```bash
docker run -d -p 3000:3000 --name spark-container spark-app
```

Check running containers:

```bash
docker ps
```

View container logs:

```bash
docker logs spark-container
```

Stop the container:

```bash
docker stop spark-container
```

Remove the container:

```bash
docker rm spark-container
```

**Note:** Run these commands from the directory containing the appropriate Dockerfile. The port mapping assumes that the application listens on port `3000` inside the container.

## 🔄 Jenkins CI/CD Pipeline

Jenkins is used to automate the application build and deployment process.

### Pipeline Stages

1. **Source Code Management:** Obtain the application code from the repository.
2. **Build:** Build the Docker image.
3. **Deployment:** Run the application using Docker.
4. **Verification:** Check the container status and application availability.

### Benefits of Jenkins

* Reduces repetitive manual work.
* Makes the deployment process more consistent.
* Helps identify build and deployment failures.
* Improves the overall development workflow.

The pipeline stages depend on the Jenkins configuration used in the project.

## 🚀 Installation and Setup

### Prerequisites

Install the following tools before running the project:

* Git
* Node.js and npm
* Docker Desktop
* Jenkins
* Visual Studio Code (recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/lekhanabm05-sys/SPARK-MERN-DevOps.git
```

### Step 2: Navigate to the Project Directory

```bash
cd SPARK-MERN-DevOps
```

### Step 3: Build the Docker Image

Ensure that the required Dockerfile is available in the current directory.

```bash
docker build -t spark-app .
```

### Step 4: Run the Docker Container

```bash
docker run -d -p 3000:3000 --name spark-container spark-app
```

### Step 5: Verify the Application

Open your browser and visit:

```text
http://localhost:3000
```

If the application uses a different internal port or requires additional services, update the Docker configuration accordingly.

### Step 6: Configure Jenkins

1. Start Jenkins.
2. Open the Jenkins dashboard.
3. Create a new Pipeline job.
4. Configure the GitHub repository.
5. Add the required build and deployment stages.
6. Run the pipeline.
7. Verify the build result and running Docker container.

## 📁 Project Structure

The project structure may vary depending on the application files and Jenkins configuration.

```text
SPARK-MERN-DevOps/
│
├── Dockerfile
├── Jenkinsfile
├── package.json
├── package-lock.json
├── src/
├── public/
├── README.md
└── .gitignore
```

**Note:** The structure above is illustrative. Keep only the files and directories that actually exist in your repository.

## 🔐 Security Practices

* Avoid uploading passwords, API keys, and database credentials to GitHub.
* Store sensitive information using appropriate environment variables or Jenkins credentials.
* Use a `.gitignore` file to exclude local configuration and unnecessary files.
* Use appropriate permissions when configuring Jenkins and Docker.

## ✅ Expected Outcomes

* Successfully manage application code using Git and GitHub.
* Build and run the application using Docker.
* Understand containerization and its benefits.
* Automate build and deployment steps using Jenkins.
* Understand the practical implementation of a CI/CD pipeline.
* Reduce manual deployment effort and improve consistency.

## 🔮 Future Enhancements

* Integrate GitHub webhooks to trigger Jenkins automatically.
* Add automated application testing.
* Introduce Docker image versioning.
* Add container security scanning.
* Deploy the application to a remote server or cloud platform.
* Implement application health checks and monitoring.

## 📝 Conclusion

The SPARK MERN DevOps project demonstrates how Git, GitHub, Docker, and Jenkins can work together to simplify application deployment.

Git and GitHub provide version control, Docker provides containerization, and Jenkins automates the build and deployment process.

This project provides practical experience with DevOps concepts and demonstrates how CI/CD can make software deployment more efficient, reliable, and repeatable.

## 👩‍💻 Author

**Lekhana B M**

MCA Student

GitHub: [lekhanabm05-sys](https://github.com/lekhanabm05-sys)

---

⭐ This project demonstrates the practical application of DevOps tools for containerization and CI/CD automation.
