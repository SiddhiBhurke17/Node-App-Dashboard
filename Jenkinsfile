pipeline {
    agent any

    environment {
        APP_NAME = "nodejs-application"
        DOCKER_IMAGE = "siddhi17/nodejs-application"
        DOCKER_CREDENTIALS = "dockerhub-creds"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling source code from GitHub...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    COMMIT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    IMAGE_TAG = "${DOCKER_IMAGE}:${COMMIT}"
                    sh "docker build -t ${IMAGE_TAG} ."
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                echo 'Pushing Docker image to DockerHub...'
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${DOCKER_IMAGE}:$(git rev-parse --short HEAD)
                        docker logout
                    '''
                }
            }
        }

        stage('Deploy Container') {
            steps {
                echo 'Deploying container on EC2...'
                script {
                    sh '''
                        # Stop old container if exists
                        docker ps -q --filter "name=nodejs-application" | grep -q . && docker stop nodejs-application && docker rm nodejs-application || true
                        
                        # Pull latest image
                        docker pull ${DOCKER_IMAGE}:$(git rev-parse --short HEAD)
                        
                        # Run container with port mapping
                        docker run -d --name nodejs-application -p 3000:3000 ${DOCKER_IMAGE}:$(git rev-parse --short HEAD)
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Image successfully built, pushed, and deployed!'
        }
        failure {
            echo 'Build failed. Check Jenkins logs.'
        }
    }
}
