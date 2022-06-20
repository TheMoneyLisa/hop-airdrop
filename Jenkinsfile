

pipeline {
    agent any
    stages {
        stage('Package') {
             steps {
                 echo "-=- packaging project -=-"
                 sh "./ci/package.sh"
             }
        }
    }
}