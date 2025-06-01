#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Function to check required environment variables
check_env_vars() {
    local required_vars=(
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "AWS_REGION"
        "ECR_REPOSITORY"
        "ECS_CLUSTER"
        "ECS_SERVICE"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "Error: $var is not set"
            exit 1
        fi
    done
}

# Function to build and push Docker images
build_and_push() {
    local environment=$1
    local tag="latest-$environment"

    echo "Building Docker images for $environment..."
    docker-compose build

    echo "Logging in to Amazon ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY

    echo "Tagging images..."
    docker tag vetopay-frontend:latest $ECR_REPOSITORY/frontend:$tag
    docker tag vetopay-backend:latest $ECR_REPOSITORY/backend:$tag

    echo "Pushing images to ECR..."
    docker push $ECR_REPOSITORY/frontend:$tag
    docker push $ECR_REPOSITORY/backend:$tag
}

# Function to update ECS services
update_ecs() {
    local environment=$1
    local tag="latest-$environment"

    echo "Updating ECS services for $environment..."
    aws ecs update-service \
        --cluster $ECS_CLUSTER \
        --service $ECS_SERVICE \
        --force-new-deployment \
        --task-definition $(aws ecs register-task-definition \
            --cli-input-json file://task-definition-$environment.json \
            --query 'taskDefinition.taskDefinitionArn' \
            --output text)
}

# Main deployment logic
case "$1" in
    "staging")
        check_env_vars
        build_and_push "staging"
        update_ecs "staging"
        ;;
    "production")
        check_env_vars
        build_and_push "production"
        update_ecs "production"
        ;;
    *)
        echo "Usage: $0 {staging|production}"
        exit 1
        ;;
esac

echo "Deployment completed successfully!" 