pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "your-dockerhub-username/node-ci-demo"
        DOCKER_TAG = "latest"
        DOCKER_CREDENTIALS = "dockerhub" // Jenkins credentials ID
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-repo.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                }
            }
        }

        stage('Login to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                }
            }
        }

        stage('Push Image to DockerHub') {
            steps {
                sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    // Stop old container if running
                    sh "docker ps -q --filter 'name=node-ci-demo' | grep -q . && docker stop node-ci-demo && docker rm node-ci-demo || true"
                    
                    // Pull latest image
                    sh "docker pull ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    
                    // Run container with port mapping
                    sh "docker run -d --name node-ci-demo -p 3000:3000 ${DOCKER_IMAGE}:${DOCKER_TAG}"
                }
            }
        }
    }
}