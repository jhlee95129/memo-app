# AI 메모 서비스

메모를 작성하면 Claude API가 자동으로 3줄 요약 + 5개 태그를 생성하는 서비스.

## 기술 스택

- **Backend**: Nest.js (TypeScript strict mode)
- **Frontend**: Next.js 14 (App Router)
- **DB**: PostgreSQL + MongoDB + Redis
- **Monorepo**: Turborepo + pnpm workspaces
- **Infra**: Docker, Kubernetes (kind / EKS), Helm, ArgoCD
- **CI/CD**: Github Actions
- **AI**: Claude API (@anthropic-ai/sdk)

## 프로젝트 구조

```
memo-app/
├── apps/
│   ├── api/           # Nest.js 모놀리식 (Phase 1) → MSA 분리 (Phase 2)
│   └── web/           # Next.js Frontend (Phase 2)
├── libs/
│   └── common/        # 공유 DTO, types
├── helm/              # Helm Charts (Phase 3)
├── k8s/               # K8s 인프라 매니페스트 (Phase 3)
├── docs/decisions/    # ADR (Architecture Decision Records)
└── docker-compose.yml # 로컬 DB
```

## 로컬 실행

```bash
# 의존성 설치
pnpm install

# DB 실행
docker compose up -d

# 환경변수 설정
cp .env.example .env

# 개발 서버 실행
pnpm dev
```

## 진행 상태

- [x] Phase 1: Nest.js 모놀리식 + Turborepo 셋업
- [ ] Phase 2: Next.js + MSA 분리
- [ ] Phase 3: Docker + 로컬 K8s
- [ ] Phase 4: EKS + Github Actions CI/CD
- [ ] Phase 5: ArgoCD GitOps
