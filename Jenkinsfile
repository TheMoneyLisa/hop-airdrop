

pipeline {
    agent any
    stages {
        stage('Package') {
             steps {
                 echo "-=- packaging project -=-"
                 sh "./ci/package-frontend.sh"
             }
        }
        stage('Deploy') {
            when {
                allOf {
                    branch 'master'
                }
            }
            steps {
                sh "./ci/tag-for-deployment-frontend.sh"
            }
        }
    }
}