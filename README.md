# AI Memo Service

메모를 작성하면 Claude API가 자동으로 **3줄 요약 + 5개 태그**를 생성하는 풀스택 마이크로서비스.

도메인은 의도적으로 단순하게 유지하고, **인프라/아키텍처 깊이**에 집중했습니다.

## 아키텍처

```
                        Internet
                           │
                           ▼
               ALB (AWS Load Balancer)
                           │
           ┌───────────────┼───────────────┐
           ▼                               ▼
     /  → web (Next.js)          /auth, /memos → gateway (Nest.js)
                                               │
                                          TCP Transport
                                               │
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
                 auth-service            memo-service            ai-service
                 (PostgreSQL)            (MongoDB)         (Redis + Claude API)
```

| 서비스 | 역할 | DB |
|--------|------|----|
| **gateway** | HTTP 수신, JWT 검증, 내부 서비스 디스패치 | - |
| **auth-service** | 회원가입, 로그인, JWT 발급 | PostgreSQL |
| **memo-service** | 메모 CRUD, 검색 | MongoDB |
| **ai-service** | Claude API 호출, 응답 캐싱, rate limiting | Redis |
| **web** | 사용자 인터페이스 | - |

## 기술 스택

### Backend
- **Nest.js** (TypeScript strict) — `@nestjs/microservices` TCP transport
- **TypeORM** + PostgreSQL (auth) / **Mongoose** + MongoDB (memo) / **Redis** (ai 캐시)
- **JWT** 인증 (bcrypt, passport) / **class-validator** DTO 검증
- **@anthropic-ai/sdk** — Claude API 자동 요약/태그 생성

### Frontend
- **Next.js 14** (App Router, standalone output)
- **Tailwind CSS** + **shadcn/ui** / **TanStack Query** / **react-hook-form** + **zod**

### Infrastructure
- **Monorepo**: Turborepo + pnpm workspaces
- **Container**: Docker multi-stage build (이미지 64~75MB)
- **K8s**: kind (로컬) / AWS EKS (프로덕션)
- **Helm 3**: Chart 기반 배포, 환경별 values 분리
- **CI/CD**: GitHub Actions (PR 빌드 검증 + main push ECR/EKS 배포)
- **Ingress**: nginx-ingress (kind) / AWS Load Balancer Controller (EKS)

### Database per Service
| 서비스 | DB | 선택 이유 |
|--------|----|----|
| auth-service | PostgreSQL (Supabase) | 사용자 데이터의 강한 일관성, 트랜잭션 |
| memo-service | MongoDB (Atlas) | 비정형 데이터, 태그 배열, 스키마 유연성 |
| ai-service | Redis (Upstash) | AI 응답 캐싱, rate limiting, 메모리 속도 |

## 프로젝트 구조

```
memo-app/
├── apps/
│   ├── gateway/          # Nest.js HTTP Gateway
│   ├── auth-service/     # Nest.js Microservice
│   ├── memo-service/     # Nest.js Microservice
│   ├── ai-service/       # Nest.js Microservice
│   └── web/              # Next.js Frontend
├── libs/
│   └── common/           # 공유 DTO, types (백/프론트 타입 계약)
├── helm/                 # Helm Charts (5개 서비스)
│   ├── */values.yaml           # dev 기본
│   └── */values-prod.example.yaml  # prod 템플릿
├── .github/workflows/
│   ├── ci.yml            # PR: build + Docker build 검증
│   └── cd.yml            # main push: ECR push + EKS Helm 배포
├── eksctl/cluster.yaml   # EKS 클러스터 설정
├── scripts/              # ECR, ALB Controller 설치 스크립트
├── docker-compose.yml    # 로컬 DB (Postgres + Mongo + Redis)
└── docker-compose.dev.yml # 전체 스택 로컬 실행
```

## 주요 기능

- 회원가입 / 로그인 (이메일 + 비밀번호, bcrypt, JWT)
- 메모 CRUD (제목, 본문, 태그, 작성일)
- 메모 작성 시 Claude API 자동 요약(3줄) + 태그(최대 5개) 생성
- 태그 / 제목 / 본문 검색
- AI 응답 Redis 캐싱 (동일 본문 재호출 방지, SHA-256 해시 키, TTL 24h)
- 사용자별 rate limiting (분당 10회)

## 로컬 실행

### 사전 요구사항

- Node.js 22+, pnpm 9+, Docker

### 개발 서버 (개별 프로세스)

```bash
# 의존성 설치
pnpm install

# 로컬 DB 실행 (PostgreSQL, MongoDB, Redis)
docker compose up -d

# 환경변수 설정
cp .env.example .env

# 전체 서비스 실행 (Turborepo)
pnpm dev
```

- Web: http://localhost:3001
- Gateway API: http://localhost:3000

### Docker Compose (전체 스택)

```bash
docker compose -f docker-compose.dev.yml up --build
```

### 로컬 Kubernetes (kind)

```bash
# 클러스터 생성
kind create cluster --name memo --config kind-config.yaml

# 네임스페이스 생성
kubectl apply -f k8s/infra/namespace.yaml

# 이미지 빌드 + kind 로드
for svc in gateway auth-service memo-service ai-service web; do
  docker build -t memo-app/$svc:latest -f apps/$svc/Dockerfile .
  kind load docker-image memo-app/$svc:latest --name memo
done

# Helm 배포
for svc in auth-service memo-service ai-service gateway web; do
  helm install $svc ./helm/$svc -n memo
done

# /etc/hosts에 추가
# 127.0.0.1 memo.local api.memo.local
```

## 프로덕션 배포 (EKS)

### 인프라 생성

```bash
# EKS 클러스터
eksctl create cluster -f eksctl/cluster.yaml

# ECR 레포지토리
bash scripts/setup-ecr.sh

# ALB Controller
bash scripts/setup-alb-controller.sh
```

### 이미지 빌드 + 배포

```bash
# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 \
  | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

# 이미지 빌드 + 푸시 (linux/amd64)
docker build --platform linux/amd64 \
  -t <ECR_URL>/memo-app/gateway:latest \
  -f apps/gateway/Dockerfile .
docker push <ECR_URL>/memo-app/gateway:latest

# Helm 배포 (시크릿은 --set으로 주입)
helm upgrade --install gateway ./helm/gateway -n memo \
  -f ./helm/gateway/values-prod.example.yaml \
  --set image.repository=<ECR_URL>/memo-app/gateway \
  --set "secret.JWT_SECRET=<value>"
```

### CI/CD (GitHub Actions)

| Workflow | 트리거 | 동작 |
|----------|--------|------|
| `ci.yml` | PR → main | pnpm build + Docker build 검증 |
| `cd.yml` | push → main | ECR push + EKS Helm 배포 (commit SHA 태그) |

필요한 GitHub Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `JWT_SECRET`, `POSTGRES_PASSWORD`, `MONGO_URI`, `REDIS_URL`, `ANTHROPIC_API_KEY`, `ALB_DNS_URL`

### 비용 관리

```bash
# 작업 종료 시 필수 — 클러스터 삭제
eksctl delete cluster --name memo-prod --region ap-northeast-2
```

매니지드 DB는 모두 무료 tier (MongoDB Atlas M0, Supabase Free, Upstash Free).

## 기술적 의사결정

### 모놀리식 → MSA 분리

초기에는 모놀리식(`apps/api`)으로 시작, 이후 4개 서비스로 분리. 분리 기준:

1. **변경 빈도 차이** — AI 서비스는 프롬프트 튜닝으로 자주 변경, auth는 안정적
2. **장애 격리** — Claude API 지연이 메모 조회에 영향 주지 않도록
3. **리소스 프로파일** — AI는 네트워크 집약적, auth는 CPU 가벼움

> 트레이드오프: 분산 트랜잭션 불가, 네트워크 오버헤드, 운영 복잡도 증가. 실무에선 트래픽/팀 규모에 따라 모놀리식이 더 나을 수도 있음.

### Database per Service

서비스별 데이터 특성에 맞는 DB를 선택. 서비스 간 조인 불가 → gateway에서 API 레벨 조합.

> 트레이드오프: DB 3개 운영 부담. 트래픽이 적다면 PostgreSQL 하나로 통합하는 것도 합리적.

### Helm values 환경 분리

하나의 Chart에 `values.yaml`(dev)과 `values-prod.example.yaml`(prod) 분리. 클러스터 내부 구조는 동일하게, 외부 의존성만 환경별로 다르게.

| 항목 | dev (kind) | prod (EKS) |
|------|------------|------------|
| 이미지 | 로컬 빌드 | ECR + commit SHA |
| Replica | 1 | 2 |
| DB | docker-compose | 매니지드 (Atlas, Supabase, Upstash) |
| Ingress | nginx-ingress | AWS ALB Controller |
| Secret | K8s Secret | GitHub Secrets → `--set` 주입 |

### Turborepo 풀스택 모노레포

`libs/common`에 공통 타입을 두고 백엔드/프론트엔드가 동시 import → **API 계약 위반을 컴파일 타임에 감지**. Turborepo 빌드 캐시로 변경분만 빌드하여 CI 시간 단축.

### Next.js EKS 배포 (Vercel 대신)

JD에 Kubernetes 기반 환경이 명시되어 있어 인프라 일관성을 우선. standalone output으로 Docker 이미지 75MB 이하 달성.

## 진행 상태

- [x] **Phase 1**: Nest.js 모놀리식 + Turborepo 셋업
- [x] **Phase 2**: Next.js 프론트엔드 + MSA 분리 (TCP transport)
- [x] **Phase 3**: Docker multi-stage build + kind Helm 배포
- [x] **Phase 4**: EKS + GitHub Actions CI/CD
