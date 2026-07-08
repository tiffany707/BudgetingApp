pipeline{
    agent any

    environment{
        NODE_VERSION = '20'
        OPENAI_API_KEY=credentials(OPENAI_API_KEY)
    }

    stages{
        stage('Checkout'){
            steps{
                checkout scm
            }
        }

        stage("Install backend"){
            steps{
                dir('Backend'){
                    sh 'npm install'
                }
            }
        }

        stage("Test backend"){
            steps{
                dir('Backend'){
                    sh 'npm test'
                }
            }
        }

        stage("Install Frontend"){
            steps{
                dir('Frontend'){
                    sh 'npm install'
                }
            }
        }

        stage("Build Frontend"){
            steps{
                dir('Frontend'){
                    sh 'npm run build'
                }
            }
        }

        stage("Compose Docker"){
            steps{
                sh "Docker compose build"
            }
        }


    }

    post{
        success{
            echo "Pipelines passed!"
        }
        failure{
            echo "Pipeline failed.."
        }
    }
}