# AI 메모 서비스 - 프로젝트 컨텍스트

## 프로젝트 목적

로앤컴퍼니(리걸테크) 백엔드 개발자 포지션 인터뷰 준비용 포트폴리오 프로젝트.
학습이 1차 목적, 면접 시연 가능한 완성도가 2차 목적.

**JD 핵심 매칭 항목:**
- Node.js + TypeScript 백엔드
- Kubernetes 기반 마이크로서비스
- MongoDB + PostgreSQL + Redis
- CI/CD (Github Actions)
- 클라우드 (AWS EKS)
- AI 응용 서비스 (Claude API)

## 도메인

**AI 메모 서비스**: 사용자가 메모를 작성하면 Claude API가 자동으로 3줄 요약 + 5개 태그를 생성한다. 검색, CRUD, 인증 포함.

도메인은 의도적으로 단순하게 유지. 복잡한 비즈니스 로직보다 **인프라/아키텍처 깊이**가 평가 대상.

### 구현할 기능 (최종 모습)

- 회원가입 / 로그인 (이메일 + 비밀번호, bcrypt, JWT)
- 메모 CRUD (제목, 본문, 태그, 작성일)
- 메모 작성 시 Claude API로 자동 요약(3줄) + 태그(최대 5개) 생성
- 태그 / 제목 / 본문 검색
- AI 응답 Redis 캐싱 (동일 본문 재호출 방지)
- 사용자별 rate limiting (분당 10회)
- 다크모드 (시간 남으면)

## 기술 스택

### Backend (Nest.js)
- Nest.js 10+ (TypeScript strict mode)
- `@nestjs/microservices`: MSA 통신
- `@nestjs/typeorm` + PostgreSQL (auth-service)
- `@nestjs/mongoose` + MongoDB (memo-service)
- `@nestjs/cache-manager` + Redis (ai-service)
- `@nestjs/jwt` + `@nestjs/passport`
- `class-validator`, `class-transformer`
- `nestjs-pino`: 구조화 로깅
- `@nestjs/terminus`: 헬스체크
- `@anthropic-ai/sdk`: Claude API
- Jest + Supertest

### Frontend (Next.js)
- Next.js 14 (App Router, standalone output)
- TypeScript strict mode
- Tailwind CSS + shadcn/ui
- TanStack Query (React Query)
- react-hook-form + zod
- JWT는 httpOnly 쿠키 저장

### Monorepo
- **Turborepo** (빌드 오케스트레이션, 캐시)
- **pnpm workspaces** (의존성 관리)
- 공통 라이브러리: `libs/common` (DTO, types)

### Infrastructure
- **Container**: Docker (multi-stage build)
- **K8s 로컬**: kind
- **K8s 프로덕션**: AWS EKS
- **Helm 3**: Chart 기반 배포 (환경별 values 분리)
- **CI**: Github Actions
- **CD**: Github Actions → Helm (Phase 4), 후 ArgoCD GitOps (Phase 5)
- **Registry**: ECR (prod), 로컬 빌드 (dev)
- **Ingress**: nginx-ingress (kind), AWS Load Balancer Controller (EKS)
- **TLS**: cert-manager + Let's Encrypt (도메인 있을 시)

### Databases (Database per Service)
- **PostgreSQL**: `auth-service` (관계형, 트랜잭션)
- **MongoDB**: `memo-service` (비정형, 태그 배열)
- **Redis**: `ai-service` (AI 응답 캐싱, rate limiting)

### 매니지드 (프로덕션)
- MongoDB Atlas (M0 무료 tier)
- Supabase (PostgreSQL 무료 tier)
- Upstash (Redis 무료 tier)

## 아키텍처

### 코드 레이어 (개발)
한 레포에 풀스택 통합. Turborepo로 빌드/캐시 관리.

```
memo-app/                            ← Turborepo 단일 레포
├── apps/
│   ├── gateway/        (Nest.js HTTP)
│   ├── auth-service/   (Nest.js Microservice)
│   ├── memo-service/   (Nest.js Microservice)
│   ├── ai-service/     (Nest.js Microservice)
│   └── web/            (Next.js Frontend)
└── libs/
    └── common/         (공유 DTO, types)
```

### 배포 레이어 (운영)
한 K8s 클러스터에 5개 독립 Pod로 배포.

```
                     Internet
                        │
                        ▼
            ALB (AWS Load Balancer)
                        │
        ┌───────────────┼───────────────┐
        ▼                               ▼
  memo.example.com               api.memo.example.com
  → web Pod (Next.js)            → gateway Pod (Nest.js)
                                        │
                                   TCP / Redis Pub-Sub
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              auth-service        memo-service        ai-service
              (PostgreSQL)        (MongoDB)           (Redis + Claude API)
```

**서비스 책임:**
- **gateway**: 외부 HTTP 수신, JWT 검증, 내부 서비스로 메시지 디스패치
- **auth-service**: 회원가입, 로그인, JWT 발급/검증
- **memo-service**: 메모 CRUD, 검색
- **ai-service**: Claude API 호출, 응답 캐싱, rate limiting
- **web**: Next.js 사용자 인터페이스

**통신 전략 (단계별 진화):**
- Phase 1-2 초반: TCP transport (인프라 0개)
- Phase 2 후반: Redis Pub/Sub 도입 (메모 작성 → AI 처리 비동기 이벤트)
- Phase 3+: 메시지 broker 패턴 정착

## 폴더 구조 (최종)

```
memo-app/
├── apps/
│   ├── gateway/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nest-cli.json
│   ├── auth-service/         # 동일 구조
│   ├── memo-service/         # 동일 구조
│   ├── ai-service/           # 동일 구조
│   └── web/
│       ├── app/              # Next.js App Router
│       ├── components/
│       ├── lib/
│       ├── Dockerfile
│       └── package.json
├── libs/
│   └── common/
│       ├── src/
│       │   ├── types/        # 백/프론트 공유 타입
│       │   ├── dto/          # Nest.js DTO
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── helm/
│   ├── gateway/
│   │   ├── Chart.yaml
│   │   ├── values.yaml          # dev 기본
│   │   ├── values-prod.yaml     # prod 오버라이드
│   │   └── templates/
│   ├── auth-service/
│   ├── memo-service/
│   ├── ai-service/
│   └── web/
├── k8s/
│   └── infra/                # cert-manager, ingress, namespace
├── argocd/                   # Phase 5 추가
│   └── applications/
├── docs/
│   ├── decisions/            # ADR (Architecture Decision Records)
│   │   ├── 001-msa-split.md
│   │   ├── 002-db-per-service.md
│   │   └── ...
│   └── interview-prep.md     # 면접 답변 정리
├── .github/
│   └── workflows/
├── docker-compose.yml        # 로컬 DB
├── docker-compose.dev.yml    # 로컬 전체 스택
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── CLAUDE.md
```

## 초기 셋업 CLI 명령어

```bash
# 1. root 초기화
pnpm init

# 2. pnpm-workspace.yaml 생성
cat <<'EOF' > pnpm-workspace.yaml
packages:
  - "apps/*"
  - "libs/*"
EOF

# 3. 디렉토리 생성
mkdir -p apps libs/common

# 4. Turborepo 설치 (workspace root이므로 -w 필수)
pnpm add -D -w turbo

# 5. turbo.json 생성
cat <<'EOF' > turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {}
  }
}
EOF

# 6. Nest.js 모놀리식 앱 생성
cd apps
npx @nestjs/cli new api --package-manager pnpm --strict
cd ..

# 7. libs/common 초기화
cd libs/common
pnpm init
cd ../..

# 8. .gitignore 생성
cat <<'EOF' > .gitignore
node_modules
dist
.next
.turbo
.env
.env.*
!.env.example
EOF

# 9. git 초기화 + 첫 커밋
git init
git add .
git commit -m "chore: Turborepo + pnpm workspace 초기화"
```

## 학습 로드맵 (5주)

---

### Phase 1: Nest.js 모놀리식 + Turborepo 셋업 (Week 1)

**셋업:**
- [x] Turborepo + pnpm workspace 초기화
- [x] `apps/api`에 Nest.js 단일 앱 생성
- [x] `libs/common` 공유 라이브러리 셋업
- [x] docker-compose.yml (Postgres + Mongo + Redis)
- [x] `.env.example`, `.gitignore`, README 초안

**개발:**
- [x] Module 구조: auth, memo, ai, common
- [x] PostgreSQL (TypeORM) + MongoDB (Mongoose) + Redis 통합
- [x] JWT 인증 (회원가입, 로그인, bcrypt, passport-jwt)
- [x] 메모 CRUD
- [x] Claude API 통합 + Redis 캐싱
- [ ] Jest 단위 테스트 (커버리지 70%+)

**완료 조건:** `pnpm dev`로 모놀리식 Nest.js 앱 동작, Postman으로 API 검증

### Phase 2: Next.js 프론트 + MSA 분리 (Week 2)

**전반 (3일): Next.js 프론트엔드**
- [x] `apps/web` 생성 (Next.js 14 App Router)
- [x] Tailwind + shadcn/ui 셋업
- [x] TanStack Query 통합
- [x] `libs/common` 타입을 프론트에서 import 검증
- [x] 로그인/회원가입 페이지
- [x] 메모 목록/상세/작성/수정/삭제
- [x] AI 요약/태그 결과 표시

**후반 (4일): MSA 분리**
- [x] `apps/api`를 4개로 분리: gateway, auth-service, memo-service, ai-service
- [x] `@nestjs/microservices` TCP transport 적용
- [x] `libs/common`에 공유 DTO, 인터페이스 추출 (message patterns, service tokens)
- [x] `@MessagePattern` 핸들러 작성
- [x] gateway에서 `ClientProxy`로 서비스 호출
- [ ] Redis Pub/Sub로 일부 통신 전환 (메모 작성 → AI 처리)
- [ ] **ADR 작성**: `001-msa-split.md`, `002-db-per-service.md`, `003-transport-redis-pubsub.md`

**완료 조건:** 5개 앱이 docker-compose.dev.yml로 동시 실행, 풀스택 동작

---

### Phase 3: Docker + 로컬 K8s (Week 3)

**Docker:**
- [ ] 5개 앱 Dockerfile (multi-stage, Node.js 20 Alpine)
- [ ] Next.js standalone output 활용
- [ ] `.dockerignore` 최적화
- [ ] 이미지 사이즈 목표: Nest 앱 < 200MB, Next.js < 250MB

**Kubernetes (kind):**
- [ ] kind 클러스터 셋업 (`kind-config.yaml`)
- [ ] Raw K8s 매니페스트 작성 (각 서비스)
  - Deployment, Service, ConfigMap, Secret
  - Liveness/Readiness probe
  - Resource limits/requests
- [ ] nginx-ingress 설치
- [ ] Ingress 매니페스트 (호스트 기반 라우팅: web vs api)
- [ ] `/etc/hosts`에 `memo.local`, `api.memo.local` 추가
- [ ] **Helm Chart로 변환** (5개)
- [ ] `values.yaml` 작성

**ADR:** `004-helm-values-split.md`, `005-ingress-routing.md`

**완료 조건:** `helm install`로 풀스택이 kind에 배포, `memo.local`로 접속

---

### Phase 4: EKS + Github Actions CI/CD (Week 4)

**EKS 셋업:**
- [ ] AWS 계정, IAM 사용자/Role
- [ ] `eksctl`로 EKS 클러스터 (t3.small Spot × 2)
- [ ] ECR 레포지토리 5개 생성
- [ ] AWS Load Balancer Controller 설치
- [ ] cert-manager + Let's Encrypt (도메인 있을 시)

**매니지드 DB 연결:**
- [ ] MongoDB Atlas M0 무료 tier
- [ ] Supabase PostgreSQL 무료 tier
- [ ] Upstash Redis 무료 tier
- [ ] `values-prod.yaml`에 연결 정보 (Secret으로)

**Github Actions:**
- [ ] PR 워크플로우: lint + test (matrix: 5개 앱)
- [ ] main push 워크플로우: build + push to ECR + helm upgrade
- [ ] Secrets: AWS credentials, DB URI, JWT secret, Claude API key
- [ ] Turborepo 캐시 활용 (`turbo build --cache-dir=.turbo`)

**비용 관리:**
- [ ] 작업 종료 시 `eksctl delete cluster` 필수
- [ ] 클러스터 재생성 스크립트 준비

**ADR:** `006-eks-vs-self-hosted.md`, `007-secret-management.md`, `008-ci-cd-pipeline.md`

**완료 조건:** main push → EKS 자동 배포, 도메인 접속, README에 스크린샷

---

### Phase 5: ArgoCD GitOps (Week 5)

- [ ] EKS에 ArgoCD 설치 (helm)
- [ ] ArgoCD UI 접속 (port-forward 또는 Ingress)
- [ ] 매니페스트 레포 분리 결정:
  - 옵션 A: 같은 레포의 `manifests/` 폴더
  - 옵션 B: 별도 `memo-app-manifests` 레포 (실무 패턴)
- [ ] ArgoCD Application 매니페스트 (5개 서비스)
- [ ] Github Actions 수정:
  - 기존: `helm upgrade` 직접 호출
  - 변경: manifests 레포의 이미지 태그만 업데이트
- [ ] ArgoCD 자동 sync 검증
- [ ] **데모 시나리오 녹화:**
  - 코드 수정 push → Actions → manifests 업데이트 → ArgoCD sync → EKS 반영
  - `git revert`로 자동 롤백 시연

**ADR:** `009-argocd-gitops.md`, `010-manifest-repo-strategy.md`

**완료 조건:** GitOps 풀 사이클 동작, README에 시연 영상/GIF

## 면접 답변 준비 (학습 목표)

이 프로젝트로 다음 9개 질문에 즉답 가능해야 한다. **외우지 말고 학습 진행하면서 자기 말로 소화할 것.** 아래는 모범 답변 + 핵심 키워드 + 예상 후속 질문.

---

### Q1. "모놀리식을 MSA로 분리한 이유와 기준은?"

**답변:**
초기에는 모놀리식으로 시작했고, 3가지 기준이 충족됐을 때 분리했다. 첫째는 **변경 빈도가 다른 도메인**이다. AI 서비스는 모델 교체나 프롬프트 튜닝으로 자주 바뀌는데, auth는 안정적이라 배포 주기가 묶이는 게 비효율적이었다. 둘째는 **장애 격리**다. Claude API가 느려지거나 실패할 때 메모 조회까지 영향받는 게 문제였다. 셋째는 **리소스 프로파일 차이**로, AI는 메모리/네트워크 집약적이고 auth는 CPU가 가벼워서 같은 노드에 두기 비효율적이었다. 다만 분리는 비용이 따른다 — 분산 트랜잭션 불가, 네트워크 오버헤드, 운영 복잡도 증가. 학습 프로젝트라 감내했고, 실무에선 트래픽/팀 규모에 따라 모놀리식 유지가 더 나을 수도 있다.

**핵심 키워드:** 변경 빈도, 장애 격리, 리소스 프로파일, 분리 비용

**예상 후속 질문:**
- "처음부터 MSA로 시작하면 안 되나?" → Martin Fowler의 monolith-first 접근. 도메인 경계가 불확실한 초기엔 모놀리식이 빠른 학습 가능.
- "팀 구조 기준은?" → Conway's Law. 실무에선 가장 중요한 기준. 1인 작업이라 제외했음.

---

### Q2. "서비스별 DB를 다르게 선택한 근거는?"

**답변:**
Database per Service 패턴을 적용했고, 각 서비스 데이터 특성에 맞췄다. **auth-service는 PostgreSQL** — 사용자 정보는 강한 일관성과 트랜잭션이 필요하고 스키마가 안정적이다. **memo-service는 MongoDB** — 메모 본문, 태그 배열, AI 메타데이터 등 비정형 데이터고 스키마 진화가 잦을 것으로 예상했다. **ai-service는 Redis** — 캐시와 rate limiting이 핵심이라 디스크 영속성보다 메모리 속도가 중요했다. 트레이드오프는 운영 복잡도 — DB 3개를 모두 관리해야 하고, 백업/모니터링 전략도 각각 필요하다. 또한 서비스 간 조인이 불가능해서 API 레벨 조합이 필요하다. 실무 트래픽이 적다면 PostgreSQL 하나로 통합하는 것도 합리적이다.

**핵심 키워드:** Database per Service, 데이터 특성 매칭, 운영 복잡도, API 레벨 조합

**예상 후속 질문:**
- "API 레벨 조합은 N+1 문제 발생하지 않나?" → BFF 패턴, gateway에서 병렬 호출, 캐싱으로 완화.
- "왜 MongoDB? PostgreSQL의 JSONB로도 되지 않나?" → 맞다. JSONB도 가능. 단지 학습 목적상 NoSQL 운영 경험을 만들기 위해 MongoDB 선택.

---

### Q3. "서비스 간 통신을 TCP에서 Redis Pub/Sub로 바꾼 이유는?"

**답변:**
초기엔 `@nestjs/microservices`의 TCP transport로 시작했다. 인프라 0개로 빠르게 MSA 구조 검증이 가능했기 때문이다. 다만 TCP는 **request-response 동기 패턴**이라 메모 작성 시 AI 요약이 끝날 때까지 사용자가 기다려야 했고, 응답 시간이 3~5초로 늘어났다. **Redis Pub/Sub로 전환**하면서 메모 저장은 즉시 응답하고, AI 처리는 백그라운드 이벤트로 분리했다. 사용자 경험이 개선되고 ai-service 장애가 메모 작성을 막지 않게 됐다. 트레이드오프는 **메시지 손실 가능성**과 **디버깅 난이도**, 그리고 **eventual consistency** 수용이 필요하다는 점이다. 학습 단계라 Pub/Sub로 충분하지만, 메시지 보장이 중요한 프로덕션이면 RabbitMQ나 Kafka가 더 적합하다.

**핵심 키워드:** 동기 vs 비동기, fire-and-forget, eventual consistency, 메시지 보장

**예상 후속 질문:**
- "Redis Pub/Sub는 메시지 손실 가능한데 괜찮나?" → 학습 목적이라 수용. 프로덕션이면 RabbitMQ의 ack 메커니즘이나 Kafka의 offset 관리가 필요.
- "왜 Kafka 안 썼나?" → 오버엔지니어링. 처리량이 작은 학습 프로젝트라 Redis가 적합. 토픽 1만 개 같은 규모면 Kafka 필요.

---

### Q4. "로컬 K8s(kind)와 프로덕션 K8s(EKS) 환경 차이는?"

**답변:**
환경 차이를 의식적으로 분리해서 관리했다. **이미지 레지스트리**는 로컬은 로컬 빌드/GHCR, 프로덕션은 ECR. **Ingress Controller**는 nginx-ingress(kind)와 AWS Load Balancer Controller(EKS). **DB**는 kind에선 docker-compose, EKS는 매니지드(MongoDB Atlas, Supabase, Upstash). **Secret**은 K8s Secret(kind)과 AWS Secrets Manager(EKS). **TLS**는 kind는 없음, EKS는 cert-manager + Let's Encrypt. **오토스케일링**은 kind 없음, EKS는 HPA + Cluster Autoscaler. 이 차이를 **Helm values 파일 분리**로 관리해서 같은 Chart로 두 환경 모두 배포 가능하게 했다. 핵심 원칙은 **클러스터 내부 구조는 동일하게, 외부 의존성만 환경별로 다르게** 가져가는 것이다.

**핵심 키워드:** 환경 격리, Helm values 분리, 매니지드 vs self-hosted, 외부 의존성

**예상 후속 질문:**
- "DB도 EKS 안에 두는 게 안 낫나?" → StatefulSet 운영 가능하지만 백업/HA 복잡. 매니지드가 학습 프로젝트엔 효율적이고 실무 패턴이기도 함.
- "왜 nginx-ingress 통일 안 했나?" → AWS LB Controller가 ALB와 통합돼서 EKS에 더 적합. 비용/기능 trade-off.

---

### Q5. "Helm values로 환경별 분리한 방식은?"

**답변:**
하나의 Chart에 `values.yaml`(dev 기본)과 `values-prod.yaml`(prod 오버라이드) 두 파일을 두는 패턴을 썼다. **values.yaml**에는 dev 환경 기본값 — replica 1, 로컬 이미지 태그, 클러스터 내부 DB URL, 작은 리소스 limit. **values-prod.yaml**에는 prod 오버라이드 — replica 3, ECR 이미지 + commit SHA 태그, 매니지드 DB URL, 큰 리소스 limit, HPA 활성화. 배포는 `helm upgrade --install memo ./chart -f values-prod.yaml`로 환경 지정. **민감 정보는 values에 직접 안 넣고** External Secrets Operator로 AWS Secrets Manager에서 주입. 트레이드오프는 values 파일이 늘어나면 관리 부담이 커지는데, 환경 3개 이상이면 Helmfile이나 Kustomize overlay 같은 도구 필요할 수 있다.

**핵심 키워드:** values 오버라이드, 환경별 파일 분리, External Secrets, 민감 정보 분리

**예상 후속 질문:**
- "Kustomize와 비교하면?" → Helm은 템플릿 엔진 + 패키지 매니저, Kustomize는 patch 기반 overlay. Helm이 변수화 강력, Kustomize가 보기 쉬움. 둘 다 실무 사용.
- "왜 ArgoCD ApplicationSet 안 썼나?" → Phase 5에서 도입. 환경이 더 많아지면 ApplicationSet으로 자동 생성.

---

### Q6. "Github Actions 단독 CI/CD vs ArgoCD GitOps 차이는?"

**답변:**
**Github Actions 단독**은 push 기반 — Actions가 `helm upgrade` 명령으로 클러스터에 직접 배포한다. 셋업 간단하고 학습 시작에 적합하다. 단점은 **Actions가 K8s 자격증명을 가져야 하고**(보안 표면 확대), **현재 클러스터 상태와 git이 불일치할 수 있으며**, 누가 kubectl로 수동 변경해도 감지 못한다. **ArgoCD GitOps**는 pull 기반 — git을 single source of truth로 두고 ArgoCD가 클러스터에서 git을 감시해 자동 sync한다. 장점은 **선언적 인프라**, **감사 추적**(모든 배포가 git history), **drift detection**(수동 변경 자동 복구), **롤백 단순**(git revert). 단점은 초기 셋업 복잡, 학습 곡선, 소규모 프로젝트엔 오버엔지니어링일 수 있다. **이 프로젝트는 두 패턴 다 구축**해서 차이를 직접 체감하고 면접에서 비교 답변 가능하게 만들었다.

**핵심 키워드:** push vs pull, single source of truth, drift detection, 감사 추적

**예상 후속 질문:**
- "ArgoCD 대신 Flux는?" → Flux도 GitOps 도구. ArgoCD는 UI 강점, Flux는 CLI/자동화 강점. CNCF 졸업 도구 둘 다.
- "어느 회사가 어느 쪽 쓰나?" → 토스/당근 ArgoCD 다수, Weaveworks(Flux 제작사 영향권) 일부 Flux. 한국 시장은 ArgoCD가 우세.

---

### Q7. "AI 서비스에서 캐싱 전략과 rate limiting은?"

**답변:**
**캐싱**은 두 레이어로 분리했다. 첫째는 **응답 캐싱** — 동일한 메모 본문이 들어오면 Claude API 재호출 없이 Redis에서 즉시 반환. 키는 본문 SHA-256 해시, TTL 24시간. 둘째는 **부분 결과 캐싱** — 요약과 태그 생성은 독립적인 호출인데, 한쪽만 실패해도 다른 결과는 살려서 재시도 비용을 줄였다. **Rate limiting**은 두 단계. 사용자별로 Redis INCR + EXPIRE 패턴으로 분당 10회 제한(애플리케이션 레벨), Claude API 자체 limit 도달 시 exponential backoff + jitter로 재시도(외부 API 레벨). 비용 관점에서도 중요한데, **캐시 적중률을 측정**해서 API 호출 비용을 추적했다. 트레이드오프는 캐시 일관성 — 동일 본문에 다른 요약을 원할 때 대응이 어렵고, `force=true` 쿼리 파라미터로 우회 옵션을 뒀다.

**핵심 키워드:** 응답 캐싱, SHA-256 해시 키, exponential backoff, 캐시 적중률, 비용 추적

**예상 후속 질문:**
- "캐시 키를 본문 해시로 하면 한 글자만 달라도 miss인데?" → semantic 캐싱(임베딩 유사도) 가능. 학습 단계엔 단순화. 실무에선 vector DB로 확장.
- "rate limit 도달 시 사용자 경험은?" → 429 응답 + Retry-After 헤더 + 프론트엔드에서 대기 시간 표시.

---

### Q8. "Turborepo 풀스택 모노레포 선택 이유와 트레이드오프는?"

**답변:**
**팀 구조와 변경 패턴이 결정 기준**이다. 풀스택을 1인 또는 소수 팀이 작업하고, 백/프론트 변경이 자주 묶이며, 타입 공유 가치가 크다고 판단해 Turborepo 풀스택 모노레포로 갔다. `libs/common`에 공통 타입을 두고 백엔드와 프론트엔드가 동시 import 해서 **API 계약 위반을 컴파일 타임에 잡는다**. Turborepo의 빌드 캐시로 변경분만 빌드해 CI 시간도 단축된다. 트레이드오프: 팀이 분리되고 서비스가 독립 배포 주기를 가지면 polyrepo가 낫고, 마이크로서비스 수십 개 이상이면 Netflix/Spotify처럼 레포 분리가 자연스럽다. 한국 스타트업 현실에선 **백엔드 모노레포 + 프론트 별도**가 가장 흔한 패턴이라 그 답변도 준비해뒀다. 빅테크는 Google/Meta의 거대 모노레포 vs Netflix의 마이크로레포로 양극화돼 있다.

**핵심 키워드:** 풀스택 모노레포, 타입 공유, 빌드 캐시, polyrepo와 trade-off, Conway's Law

**예상 후속 질문:**
- "Nx 안 쓰고 Turborepo 쓴 이유는?" → Nx는 기능 풍부하지만 학습 곡선 큼. Turborepo는 빌드 캐시 + 워크스페이스 중심으로 단순. 학습 단계엔 Turborepo가 효율.
- "타입 공유는 OpenAPI 자동 생성으로도 가능하지 않나?" → 맞다. Nest.js Swagger → openapi-typescript-codegen으로 프론트 타입 자동 생성. polyrepo면 그 방식이 표준.

---

### Q9. "Next.js를 Vercel이 아닌 EKS에 배포한 이유는?"

**답변:**
**일관성과 운영 통제**를 위해서다. JD에 Kubernetes 기반 환경이 명시돼 있어서, 프론트도 같은 K8s에 두는 게 인프라 일관성에 맞다. Next.js 14의 **standalone output**으로 Docker 이미지를 200MB 이하로 만들고, ALB Ingress로 web과 API를 호스트 기반 라우팅했다(`memo.example.com`, `api.memo.example.com`). 장점은 **단일 운영 환경**(K8s, Helm, ArgoCD 동일 도구), **VPC 내부 통신**(gateway 호출이 클러스터 내부 네트워크), **보안 통제** 일원화. 단점은 Vercel의 **Edge 캐싱, ISR 자동 최적화, Preview 환경**을 활용 못 한다는 점이다. 실무에선 마케팅 사이트 같은 정적 페이지가 많으면 Vercel이 낫고, 사내 인프라 일관성이 중요하면 K8s가 낫다. 이 프로젝트는 **학습 목적상 K8s 통합 경험**이 더 가치 있다고 판단했다.

**핵심 키워드:** 인프라 일관성, standalone output, 호스트 기반 라우팅, Edge 캐싱 trade-off

**예상 후속 질문:**
- "ISR을 K8s에서 어떻게 구현하나?" → Next.js 자체가 ISR 지원, 캐시는 파일시스템 또는 외부 스토리지(S3, Redis). 멀티 인스턴스면 캐시 공유 전략 필요.
- "프론트만 Vercel, 백엔드는 EKS 분리는?" → 가능하고 흔한 패턴. CORS와 도메인 관리만 신경 쓰면 됨. 학습 통합성을 위해 안 했을 뿐.

---

**답변 활용 원칙:**
1. **외우지 말고 소화할 것.** 면접에서 토씨 똑같이 나오면 부자연스럽다.
2. **트레이드오프는 항상 짚을 것.** 시니어 시그널의 핵심.
3. **"실무에선 다를 수 있다"는 인지 표현.** 학습 프로젝트의 한계를 솔직히 인정.
4. **모르는 후속 질문은 솔직히 모른다고.** 거짓 답변보다 "그 부분은 깊게 보지 못했고, 이런 방향으로 접근해보겠다"가 낫다.

## 코딩 컨벤션

### TypeScript
- `strict: true` 필수 (모든 앱)
- 명시적 타입 선언, `any` 금지
- `interface`: 객체 구조 / `type`: 유니온, 유틸리티

### Nest.js
- 모듈은 도메인 단위 분리 (auth, memo, ai)
- DTO는 `class-validator` 데코레이터 필수
- 서비스 → 컨트롤러 의존 (역방향 금지)
- 에러: `HttpException` (HTTP) / `RpcException` (Microservice)
- 비즈니스 로직은 서비스, 컨트롤러는 얇게

### Next.js
- Server Component 우선, Client Component는 필요한 경우만
- 데이터 fetching: Server Component (SSR) 또는 TanStack Query (CSR)
- 폼: react-hook-form + zod
- 스타일: Tailwind 유틸리티, 컴포넌트는 shadcn/ui 기반

### 공통
- ESLint + Prettier (pre-commit hook)
- 한국어 주석 OK
- 함수/변수: 영어 camelCase
- 파일명: kebab-case (`memo.service.ts`)
- 환경변수: SCREAMING_SNAKE_CASE

### Git 커밋
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`
- Scope 명시: `feat(auth): JWT 발급 로직 추가`
- 한국어 커밋 메시지 허용

### 테스트
- 서비스 레이어 단위 테스트 필수
- e2e는 핵심 플로우만 (로그인, 메모 CRUD)
- 커버리지 70%+ 유지

## Turborepo 설정 가이드

### turbo.json (핵심)
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {}
  }
}
```

### libs/common 의존 추가
```json
// apps/gateway/package.json
{
  "dependencies": {
    "@memo-app/common": "workspace:*"
  }
}
```

## 환경 변수 관리

- **로컬**: `.env.development` (gitignore)
- **예시**: `.env.example` (커밋, 키만)
- **K8s 로컬**: ConfigMap + Secret
- **K8s 프로덕션**: AWS Secrets Manager + External Secrets Operator (선택)
- **CI/CD**: Github Actions Secrets

## 자주 쓰는 명령어

### 개발
```bash
pnpm install                       # 의존성 설치
docker compose up -d               # 로컬 DB (Phase 1-2)
docker compose -f docker-compose.dev.yml up   # 전체 스택 (Phase 2-3)
pnpm dev                          # 전체 실행 (turbo)
pnpm dev --filter=gateway         # 특정 앱만
pnpm dev --filter=...             # 의존성까지
pnpm build                        # 전체 빌드
pnpm test                         # 테스트 전체
pnpm lint                         # 린트 전체
```

### Docker
```bash
docker build -t memo-app/gateway -f apps/gateway/Dockerfile .
docker images | grep memo-app
```

### Kubernetes (로컬)
```bash
kind create cluster --name memo --config kind-config.yaml
kubectl config use-context kind-memo
kubectl apply -f k8s/infra/
helm install gateway ./helm/gateway -n memo
kubectl get pods -n memo
kubectl logs -f deploy/gateway -n memo
kubectl port-forward svc/gateway 3000:3000 -n memo
```

### Kubernetes (EKS)
```bash
eksctl create cluster -f cluster.yaml
aws ecr get-login-password --region ap-northeast-2 \
  | docker login --username AWS --password-stdin <ECR_URL>
helm upgrade --install memo ./helm/memo-app -f values-prod.yaml
eksctl delete cluster --name memo-prod    # 비용 절약, 작업 종료 시 필수
```

### ArgoCD
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
argocd app sync memo-gateway
argocd app history memo-gateway
```

## ADR (Architecture Decision Records)

각 의사결정은 `docs/decisions/` 폴더에 ADR로 기록한다. 면접 답변과 직결되므로 결정 즉시 작성.

**템플릿:**
```markdown
# ADR-XXX: [결정 제목]

## 상태
제안됨 / 채택됨 / 폐기됨 / 대체됨

## 컨텍스트
어떤 상황에서 결정해야 했는가? 어떤 제약이 있었는가?

## 결정
무엇을 선택했는가? 구체적으로.

## 근거
왜 이걸 선택했는가? 다른 대안은 무엇이었고 왜 버렸는가?

## 결과
긍정적 결과는? 부정적 결과는? 트레이드오프는?
```

**작성 원칙:**
- 결정 직후 즉시 작성. 나중에 쓰면 동기 흐려짐.
- 200~400단어, A4 1페이지 미만.
- 면접 답변(위 Q1~Q9)과 연결되는 부분 명시.

**예정된 ADR:**
- 001: 모놀리식 → MSA 분리 (Q1과 연결)
- 002: Database per Service 패턴 (Q2)
- 003: TCP → Redis Pub/Sub 전환 (Q3)
- 004: Helm values 환경별 분리 (Q4, Q5)
- 005: Ingress 라우팅 전략 (Q4)
- 006: EKS vs self-hosted K8s (Q4)
- 007: Secret 관리 전략 (Q5)
- 008: CI/CD 파이프라인 설계 (Q6)
- 009: ArgoCD GitOps 도입 (Q6)
- 010: 매니페스트 레포 분리 전략 (Q6)
- 011: Turborepo 풀스택 모노레포 (Q8)
- 012: Next.js EKS 배포 (Q9)
- 013: AI 캐싱 + rate limiting 전략 (Q7)

## 중요 원칙

1. **모놀리식부터 시작.** 의도적인 분리 과정 자체가 학습 가치.

2. **로컬에서 99% 완성.** EKS는 면접 어필용 단기 사용 (수 시간 단위).

3. **각 의사결정에 ADR 남기기.** 면접 답변(Q1~Q9) 무기.

4. **과한 추상화 금지.** 학습 프로젝트라 직관적 코드 우선. 일반화는 두 번째 유사 케이스 등장 후.

5. **README는 면접관이 본다.**
   - 아키텍처 다이어그램
   - 기술 스택 + 선택 이유
   - 로컬 실행 방법
   - 프로덕션 배포 시연 (스크린샷/GIF)
   - 의사결정 요약 (ADR 링크)

6. **테스트 코드는 우대사항.** 서비스 레이어 단위 테스트는 최소한 작성.

7. **Turborepo 캐시 활용.** CI에서 빌드 캐시로 시간 단축 시연.

8. **타입 공유 적극 활용.** `libs/common`을 단순 DTO가 아닌 백/프론트 계약으로 사용.

## 비용 관리

EKS 사용 시 작업 종료 시 무조건 클러스터 삭제. 매니페스트는 git에 있으므로 재생성 5~10분.

**예상 총 비용 (5주):** $15~20

## 작업 진행 시 주의사항

- 새 기술 도입 전 **트레이드오프 명시** (장점/단점 둘 다)
- 라이브러리 추가 시 **최신 + 안정 버전** 검토
- K8s 매니페스트 변경 시 **dev/prod 둘 다 영향 체크**
- Secret 정보는 절대 git에 커밋 금지
- 작업 완료 후 `docs/decisions/` 업데이트
- 매 Phase 완료 시 README 업데이트
- ADR 작성 시 면접 답변(Q1~Q9)과 어떻게 연결되는지 명시

## 현재 진행 상태

- [x] Phase 1: Nest.js 모놀리식 + Turborepo 셋업 (테스트 제외)
- [x] Phase 2: Next.js + MSA 분리 (Redis Pub/Sub, ADR 제외)
- [ ] Phase 3: Docker + 로컬 K8s
- [ ] Phase 4: EKS + Github Actions CI/CD
- [ ] Phase 5: ArgoCD GitOps