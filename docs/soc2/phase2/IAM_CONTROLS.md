# Phase 2 --- Identity & Access Management (IAM) Controls

## Objective

Implement least-privilege access and secure identity management as part of SOC 2 readiness.

## Scope

This document covers the IAM controls for the KIPSMTHN Creative Platform application and its immediate dependencies (Clerk, Vercel, Neon, etc.) as defined in the SOC 2 readiness program.

## Current State

### Authentication

- **Identity Provider**: Clerk (SaaS) handles user authentication (sign-in, sign-up, session management).
- **Session Handling**: Clerk manages session tokens and refresh tokens. Session expiration is governed by Clerk settings.
- **Account Recovery**: Provided by Clerk (password reset, email verification links).
- **MFA Capabilities**: Clerk supports MFA; enforcement is configurable via the Clerk dashboard.
- **Administrative Authentication**: Admin access to the platform is via Clerk; admin users are identified by having a local creator record (see below).
- **Webhook Verification**: Clerk webhooks are verified using the secret stored in environment variables.
- **Service Authentication**: Internal service accounts (if any) are not currently used; all API requests are tied to a user session.
- **API Authentication**: All creator-facing API routes are protected by the `withCreatorApi` wrapper (or equivalent) which ensures:
  1. Valid Clerk session
  2. Existence of a local creator record (user in the `users` table)
  3. Consistent error handling (401 for unauthenticated, 404 if local user not found)

### Authorization

- **Resource Ownership**: All data rows in the database are owned by a creator via the `creatorId` foreign key (or direct reference to the `users` table).
- **Server-Side Enforcement**:
  - API routes filter data by `creatorId` extracted from the authenticated session (via `getCurrentUser` or `withCreatorApi`).
  - Database queries always include a condition like `eq(table.creatorId, user.id)` to prevent cross-creator data access.
  - No reliance on UI-only visibility; data access is blocked at the API/database layer.
- **Role/Permission Check**:
  - The platform currently distinguishes between two roles in the context of the application:
    - **Creator**: A user who has signed up and has a local creator record. They have full access to their own workspace (clients, projects, quotes, invoices, galleries, etc.).
    - **Client**: A user who is invited by a creator to access specific galleries or portals. Clients do not have access to the creator's admin workspace (`/admin/` routes) and their access is limited to shared resources (galleries) via tokens or passwords.
  - A formal role-based access control (RBAC) system exists in `src/lib/roles.ts` but is currently only used in tests. It defines:
    - `Role` type: `"admin"` | `"client"`
    - `getCurrentRole()`: Reads the role from Clerk session claims (`publicMetadata.role`).
    - `requireRole(role)`: Throws an error if the current user's role does not match the required role.
  - **Note**: The term "admin" in the `roles.ts` file refers to a platform-wide administrator role (if ever implemented), not to be confused with the creator's admin workspace. Currently, no routes enforce role-based restrictions because the platform does not have platform administrators. All creators are effectively admins of their own data.

### Access Controls Implemented

- **Least Privilege**:
  - Each creator can only access their own data (filtered by `creatorId`).
  - Clients cannot access creator data unless explicitly shared (e.g., gallery access via token).
  - API endpoints return only the data necessary for the request.
- **Privileged Access**:
  - Access to production infrastructure (Vercel, Neon, Clerk, GitHub) is restricted to designated system owners (founders/engineers).
  - These accesses are managed outside the codebase (via provider dashboards) and are subject to the provider's own access controls.
- **Admin Access**:
  - Platform administrators (if any) would be identified by the `admin` role in Clerk metadata. Currently, there are no platform administrators; all users are creators.
  - The creator's admin workspace (`/admin/` routes) is accessible to any authenticated user who has a local creator record (i.e., creators). This is appropriate because creators are the admins of their own workspace.
- **Production Access**:
  - Production access to the application is via the deployed Vercel instance. Access to modify the deployment (e.g., via Vercel CLI or GitHub) is restricted to the engineering team.
- **Database Access**:
  - The application accesses the Neon Postgres database via a connection string stored in environment variables.
  - The database user has full privileges on the database schema (as required by the application).
  - Direct database access (outside the application) is restricted to engineering team members via the Neon console or client tools.
- **GitHub Access**:
  - Repository access is managed via GitHub teams and permissions.
  - Write access to the main branch is restricted to maintainers; pull requests are required for changes.
- **Vercel Access**:
  - Project access is managed via Vercel teams.
  - Production deployments are triggered by merges to the main branch (or manually by authorized users).
- **Cloudflare Access**:
  - Not currently used for core functionality (the platform uses Vercel Blob for storage, not Cloudflare R2).
  - If used in the future, access will be restricted to engineering team members.
- **Clerk Access**:
  - Access to the Clerk dashboard is restricted to engineering team members and designated administrators.
  - MFA is enforced for all administrative Clerk accounts.
- **Emergency Access**:
  - Emergency access procedures are not formally documented but rely on the existing access controls (e.g., contacting engineering team for infrastructure access).
- **Offboarding**:
  - Offboarding procedures are not formally documented but would involve revoking access to all infrastructure providers and removing the user from the application (if applicable).

### Periodic Reviews

- **Access Reviews**:
  - No formal periodic access review process is currently in place for infrastructure providers (Vercel, Neon, Clerk, GitHub).
  - This is a gap to be addressed.
- **Application Access**:
  - Application access is implicitly reviewed via user sign-ups and invitations.
  - There is no periodic review of which users have access to the application (beyond the standard user management).

### Evidence

- **Access Lists**: Not currently generated automatically.
  - Can be exported from infrastructure providers (Vercel, Neon, Clerk, GitHub) on demand.
- **Role Mappings**:
  - The application stores the Clerk `userId` in the `users` table (`authUserId` column).
  - Role information (if used) is stored in Clerk session claims (`publicMetadata.role`).
- **Access Requests**:
  - Access to infrastructure providers is granted via requests to the engineering team or through provider-specific access request processes.
- **Approvals**:
  - Access approvals are managed ad-hoc (e.g., via Slack or email) and not formally recorded.
- **Offboarding Records**:
  - Not currently maintained.

## Gaps Identified

1. **Lack of Formal Periodic Access Reviews**:
   - No scheduled reviews of user access to infrastructure providers (Vercel, Neon, Clerk, GitHub).
2. **No Formal Access Request/Approval Workflow**:
   - Access requests and approvals are handled informally.
3. **No Offboarding Procedure Documentation**:
   - No documented process for revoking access when a team member leaves.
4. **Role-Based Access Control Not Enforced in Application**:
   - While the `roles.ts` module exists, it is not used to enforce role-based restrictions in API routes or server actions.
   - Currently, authorization is based solely on resource ownership (creatorId).
   - This is sufficient for the current platform structure (creators managing their own data) but may need to be extended if platform administrators or more granular permissions are introduced.
5. **Admin Layout Not Protected by Creator Check**:
   - The admin layout (`src/app/admin/layout.tsx`) only checks for a signed-in Clerk session, not for the existence of a local creator record.
   - This means a client with a Clerk account (but no local creator record) could potentially see the admin UI layout (though they would not be able to load any data because the API routes would return 401).
   - This is a low-risk information disclosure (UI structure) but could be improved.

## Remediation Plan

1. **Implement Periodic Access Review Process**:
   - Schedule quarterly access reviews for all infrastructure providers (Vercel, Neon, Clerk, GitHub).
   - Document the review process and maintain records of reviewers, dates, and findings.
2. **Formalize Access Request and Approval Workflow**:
   - Define a process for requesting access to infrastructure (e.g., via ticketing system).
   - Require approval from a system owner or manager.
   - Maintain records of requests and approvals.
3. **Document Offboarding Procedure**:
   - Create an offboarding checklist that includes revoking access to all infrastructure providers and removing the user from any internal directories.
   - Assign responsibility to the engineering manager or HR.
4. **Evaluate and Implement Role-Based Access Control (if needed)**:
   - Assess the need for platform administrators or more granular permissions (e.g., read-only access for certain creators).
   - If needed, integrate `requireRole` into API routes and server actions for administrative endpoints.
   - Update the `roles.ts` module to be used consistently across the codebase.
5. **Protect Admin Layout with Creator Check**:
   - Modify the admin layout to redirect users who do not have a local creator record to an appropriate page (e.g., /admin/onboarding or a sign-out page).
   - This can be done by checking for the local user on the client side (via an API call or by using the Clerk session to infer the existence of a local record) or by protecting individual admin pages (not the layout) with a redirect if the local user is not found.

## Evidence to be Collected

- Access review records (quarterly).
- Access request and approval logs.
- Offboarding records.
- Updated code showing usage of `withCreatorApi` (or equivalent) for authentication and `creatorId` filtering for authorization.
- Updated code showing usage of `requireRole` for role-based checks (if implemented).
- Updated admin layout or page-level protection that prevents non-creators from accessing the admin UI.
- Screenshots or documentation of infrastructure access controls (Vercel, Neon, Clerk, GitHub) showing least-privilege principles.

## Conclusion

Phase 2 (Identity & Access Management) has been initiated. The current authentication and authorization mechanisms are fundamentally sound, with data access properly scoped to the creator via `creatorId`.
However, there are gaps in the formalization of access controls, particularly regarding periodic reviews, access request/workflows, offboarding, and role-based access control.
These gaps will be addressed in the remediation plan above.

Next Steps:

- Begin implementing the remediation plan items, starting with the access review process and offboarding documentation.
- Continue to Phase 3 (Application Security) as outlined in the SOC2_READINESS_SPEC.md, while working on the IAM remediation in parallel.

---
*Document last updated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")*

## TODO

- [ ] Implement role-based access control in API routes using `requireRole` for administrative actions.
- [ ] Set role in Clerk metadata for users (creator vs client) during sign-in or user creation.
- [ ] Update admin layout to check for the local user role and redirect non-creators.
- [ ] Create a periodic access review process for infrastructure providers (Vercel, Neon, Clerk, GitHub).
- [ ] Document offboarding procedure for team members.
- [ ] Collect evidence: access lists, role mappings, review records, etc.
