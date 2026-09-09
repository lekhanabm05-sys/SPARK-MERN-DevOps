pipeline {
    agent any

    stages {

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                bat 'npm ci'
            }
        }

        stage('Build Application') {
            steps {
                echo 'Building SPARK application...'
                bat 'npm run build'
            }
        }

        stage('Create Environment File') {
            steps {
                withCredentials([
                    string(credentialsId: 'mongodb-uri', variable: 'MONGODB_URI'),
                    string(credentialsId: 'gemini-api-key', variable: 'GEMINI_API_KEY')
                ]) {
                    powershell '''
                        @(
                            "MONGODB_URI=$env:MONGODB_URI"
                            "GEMINI_API_KEY=$env:GEMINI_API_KEY"
                        ) | Set-Content -Path ".env" -Encoding UTF8
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building SPARK Docker image...'
                bat 'docker compose build'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying SPARK using Docker Compose...'
                bat 'docker compose down'
                bat 'docker compose up -d'
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Checking SPARK container...'
                bat 'docker compose ps'
            }
        }
    }

    post {
        success {
            echo 'SPARK CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'SPARK CI/CD Pipeline failed.'
        }

        always {
            powershell '''
                if (Test-Path ".env") {
                    Remove-Item ".env" -Force
                }
            '''
        }
    }
}