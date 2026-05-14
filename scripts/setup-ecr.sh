#!/bin/bash
set -euo pipefail

AWS_PROFILE=${AWS_PROFILE:-jhlee95129}
AWS_REGION=${AWS_REGION:-ap-northeast-2}

SERVICES=("gateway" "auth-service" "memo-service" "ai-service" "web")

echo "=== ECR 레포지토리 생성 ==="
echo "Profile: $AWS_PROFILE / Region: $AWS_REGION"

for svc in "${SERVICES[@]}"; do
  REPO_NAME="memo-app/${svc}"
  echo -n "Creating ${REPO_NAME}... "

  aws ecr create-repository \
    --repository-name "$REPO_NAME" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    2>/dev/null && echo "OK" || echo "already exists"
done

ACCOUNT_ID=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text)
echo ""
echo "=== ECR 레포지토리 목록 ==="
aws ecr describe-repositories \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  --query 'repositories[?starts_with(repositoryName, `memo-app/`)].repositoryUri' \
  --output table

echo ""
echo "=== Docker 로그인 명령어 ==="
echo "aws ecr get-login-password --region $AWS_REGION --profile $AWS_PROFILE | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
