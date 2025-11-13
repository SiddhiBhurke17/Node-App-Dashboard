pipeline {
    agent any

    environment {
        APP_NAME = "nodejs-application"
        DOCKER_IMAGE = "siddhi17/nodejs-application"
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
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${DOCKER_IMAGE}:$(git rev-parse --short HEAD)
                        docker logout
                    '''
                }
            }
        }
    }

    post {
        success {
            echo ' Image successfully built and pushed to DockerHub!'
        }
        failure {
            echo ' Build failed. Check Jenkins logs.'
        }
    }
}
