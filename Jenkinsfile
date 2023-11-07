pipeline {
      agent any
  environment {
    DOCKERHUB_CREDENTIALS = credentials('docker-hub')
    SSH_CREDENTIALS = credentials('ec2-server-key')
  } 
  stages {
      stage('Build') {
      steps {
        sh "docker build -t react-app:$env.BUILD_ID ."
        echo "build id: $env.BUILD_ID"
      }
    }
    stage('Login') {
      steps {
        sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
      }
    }
    stage('Push') {
      steps {
        // push the image with 'latest' tag
        sh "docker tag react-app:$env.BUILD_ID khorkch/jenkins-docker:latest"
        sh 'docker push khorkch/jenkins-docker:latest'
        sh "docker rmi react-app:$env.BUILD_ID"
      }
    }
    stage('Test') {
      stages {
        stage('OWASP DependencyCheck') {
          steps {
            dependencyCheck additionalArguments: '''
                          -o './'
                          -s './'
                          -f 'ALL' 
                          --prettyPrint''', odcInstallation: 'OWASP Dependency-Check'
                      dependencyCheckPublisher pattern: 'dependency-check-report.xml'
                
          }
        }
      }
    }
    stage('Deploy to Production') {
        steps {
            script {
                // Use SSH credentials to connect to the EC2 instance
                sshagent(credentials: ['SSH_CREDENTIALS']) {
                    sh """ 
                        if docker ps -a | grep -q jenkins-docker-container; then
                            docker stop jenkins-docker-container
                            docker rm jenkins-docker-container
                        fi
              
                        images_to_remove=\$(docker images -a | grep none | awk '{ print \$3; }')
                        if [ -n "\$images_to_remove" ]; then
                            echo "Removing unused images..."
                            echo "\$images_to_remove" | xargs docker rmi --force
                        else
                            echo "No unused images to remove."
                        fi

                        docker run --name jenkins-docker-container --restart=on-failure --detach \\
                            --privileged \\
                            --network jenkins \\
                            --env DOCKER_CERT_PATH=/certs/client --env DOCKER_TLS_VERIFY=1 \\
                            --publish 3000:3000 \\
                            --volume jenkins-data:/var/jenkins_home \\
                            --volume jenkins-docker-certs:/certs/client:ro \\
                            khorkch/jenkins-docker

                        docker cp /config.env jenkins-docker-container:/app/.env
                        docker system prune -f
                    """
                }
            }
        }
    }
  }
  post {
    always {
      sh 'docker logout'
    }
  }
}
