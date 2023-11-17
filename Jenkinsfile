pipeline {
    agent any
    stages {
        
        stage('OWASP DependencyCheck') {
			steps {
				echo"Doing OWASP Dependency Check.."
				dependencyCheck additionalArguments: '--format HTML --format XML', odcInstallation: 'OWASPCheck'
			}
		}
    }
    post {
    always {
      dependencyCheckPublisher pattern: 'dependency-check-report.xml'
    }
  }
}
