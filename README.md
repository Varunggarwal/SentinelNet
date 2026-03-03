# SentinelNet

SentinelNet is a decentralized incentivized uptime monitoring protocol built using a modern Turborepo monorepo architecture.

It distributes website health checks across independent validator nodes and rewards participants for honest reporting, creating a trust-minimized uptime verification layer.

---

## Using this repository

Clone the repository:

git clone https://github.com/Varunggarwal/SentinelNet.git  
cd sentinelnet  

Install dependencies:

pnpm install  

---

## What’s inside?

This Turborepo includes the following apps and packages:

### Apps

- frontend – Next.js dashboard for monitoring websites and validator activity  
- api – Backend aggregation service handling uptime consensus and reward logic  
- hub – Coordination service for validator orchestration  
- validator – Distributed node service that performs uptime checks  

### Packages

- @repo/db – Prisma schema and database layer  
- @repo/common – Shared types and utilities  
- @repo/ui – Shared UI components  
- @repo/eslint-config – ESLint configuration  
- @repo/typescript-config – Shared TypeScript configuration  

All applications and packages are written in TypeScript.

---

## Architecture Overview

SentinelNet operates in four layers:

1. Website Registration  
   Users register endpoints for monitoring.

2. Distributed Validation  
   Validator nodes periodically ping websites and submit signed reports.

3. Consensus & Aggregation  
   The hub aggregates reports and determines uptime status via consensus.

4. Incentive Distribution  
   Validators are rewarded for accurate, consistent participation.

---

## Utilities

This Turborepo is configured with:

- TypeScript for static type checking  
- ESLint for code quality enforcement  
- Prettier for formatting  
- Prisma ORM for database abstraction  
- Turbo for task orchestration and caching  

---

## Build

To build all apps and packages:

pnpm build  

To build a specific app:

pnpm turbo run build --filter=frontend  

---

## Develop

To run all services in development mode:

pnpm dev  

To run a specific service:

pnpm turbo run dev --filter=api  

---

## Environment Variables

Create a `.env` file at the root or per app:

DATABASE_URL=  
NEXT_PUBLIC_API_URL=  
JWT_SECRET=  

Do not commit `.env` to version control.

---

## Deployment

Frontend is deployed on Vercel.  
Backend services can be deployed on Render, Railway, or similar platforms.

Monorepo root directory should not be deployed directly — configure deployment per app.

---

## Remote Caching

SentinelNet uses Turborepo’s built-in caching.

To enable remote caching with Vercel:

npx turbo login  
npx turbo link  

This links your Turborepo to Vercel’s Remote Cache.

---

## Roadmap

- On-chain reward settlement  
- Validator reputation scoring  
- Slashing for dishonest reporting  
- Multi-region consensus expansion  
- Analytics dashboard improvements  
- Decentralized coordination layer  

---

## License

MIT License  

---

## Author

Varun Aggarwal  
Computer Science & Data Science  
Focused on distributed systems, AI, and scalable infrastructure
