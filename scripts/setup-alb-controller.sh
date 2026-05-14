#!/bin/bash
set -euo pipefail

AWS_PROFILE=${AWS_PROFILE:-jhlee95129}
AWS_REGION=${AWS_REGION:-ap-northeast-2}
CLUSTER_NAME=${CLUSTER_NAME:-memo-prod}

ACCOUNT_ID=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text)

echo "=== AWS Load Balancer Controller 설치 ==="
echo "Cluster: $CLUSTER_NAME / Region: $AWS_REGION / Account: $ACCOUNT_ID"

# 1. IAM Policy 생성
echo ""
echo "--- Step 1: IAM Policy 생성 ---"
curl -sO https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.1/docs/install/iam_policy.json

aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json \
  --profile "$AWS_PROFILE" \
  2>/dev/null && echo "Policy created" || echo "Policy already exists"

rm -f iam_policy.json

# 2. IRSA (IAM Role for Service Account) 생성
echo ""
echo "--- Step 2: IRSA ServiceAccount 생성 ---"
eksctl create iamserviceaccount \
  --cluster="$CLUSTER_NAME" \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn="arn:aws:iam::${ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy" \
  --approve \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  2>/dev/null && echo "ServiceAccount created" || echo "ServiceAccount already exists"

# 3. Helm repo 추가 + 설치
echo ""
echo "--- Step 3: Helm으로 ALB Controller 설치 ---"
helm repo add eks https://aws.github.io/eks-charts 2>/dev/null || true
helm repo update

helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName="$CLUSTER_NAME" \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region="$AWS_REGION" \
  --set vpcId="$(aws eks describe-cluster --name "$CLUSTER_NAME" --profile "$AWS_PROFILE" --region "$AWS_REGION" --query 'cluster.resourcesVpcConfig.vpcId' --output text)"

echo ""
echo "=== 설치 완료 ==="
echo "확인: kubectl get deployment -n kube-system aws-load-balancer-controller"
