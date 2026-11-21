# Security Specification — Buletin SIB TOBURON

## 1. Data Invariants
1. **Default Deny**: All unmatched Firestore paths are strictly denied (`allow read, write: if false`).
2. **Public Published Content Only**: Unauthenticated and non-admin congregation devices may only `get` or `list` documents in `/news`, `/schedules`, and `/gallery` where `resource.data.status == 'published'`. Draft documents are never exposed to the public.
3. **Zero PII Exposure**: Public collections (`/news`, `/schedules`, `/gallery`) contain no PII (no email addresses, phone numbers, or home addresses). The `/admins` collection stores only `displayName`, `role`, `addedByUid`, and `createdAt`, and is readable strictly by the owning UID or verified admins.
4. **Verified Admin Writes Only**: Every `create`, `update`, and `delete` operation across `/news`, `/schedules`, `/gallery`, and `/admins` requires `request.auth != null`, `request.auth.token.email_verified == true`, and verified admin identity (bootstrapped verified admin email or verified `/admins/{uid}` record).
5. **Strict Schema & Immutability**: Every write validates exact required/allowed keys (`hasAll` + `hasOnly`), string `.size()` bounds, regex patterns (`YYYY-MM-DD`, `HH:mm`, URL prefix, ID format), immutable `authorUid` and `createdAt`, and server-enforced timestamps (`request.time`).
6. **Zero Cost-Explosion List Rules**: `allow list` rules never invoke `get()` or `exists()`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Write**: Anonymous client attempts `create` on `/news/attack1` -> `PERMISSION_DENIED`.
2. **Unverified Admin Email Spoof**: Signed-in user with `email: "raxxon47@gmail.com"` and `email_verified: false` attempts `create` on `/news/spoof1` -> `PERMISSION_DENIED`.
3. **Self-Assigned Admin Escalation**: Regular verified user attempts `create` on `/admins/{ownUid}` with `{ role: "admin" }` -> `PERMISSION_DENIED`.
4. **Shadow / Ghost Field Injection**: Verified admin attempts `create` on `/news/ghost1` including an extra field `isOfficial: true` -> `PERMISSION_DENIED`.
5. **ID Poisoning**: Verified admin attempts `create` on `/news/invalid id with spaces and $chars` -> `PERMISSION_DENIED`.
6. **Denial-of-Wallet Oversized String**: Verified admin attempts `create` on `/schedules/big1` with a 5,000-char `title` -> `PERMISSION_DENIED`.
7. **Forged Client Timestamp**: Verified admin attempts `create` on `/gallery/time1` with a backdated client timestamp instead of `serverTimestamp()` -> `PERMISSION_DENIED`.
8. **Author UID Spoofing**: Verified admin attempts `create` on `/news/fakeauthor` with `authorUid: "someone-else"` -> `PERMISSION_DENIED`.
9. **Immutable Field Tampering**: Verified admin attempts `update` on `/news/doc1` changing `createdAt` or `authorUid` -> `PERMISSION_DENIED`.
10. **Value Poisoning on Allowed Key**: Verified admin attempts `update` on `/schedules/doc1` setting `startTime: "not-a-time"` or `category: "Invalid"` -> `PERMISSION_DENIED`.
11. **Draft Scraping by Congregation**: Unauthenticated client attempts `list` on `/news` without filtering `status == 'published'` or `get` on a `status: 'draft'` doc -> `PERMISSION_DENIED`.
12. **Admin Registry Enumeration**: Regular signed-in user attempts `list` or `get` on `/admins/{otherUid}` -> `PERMISSION_DENIED`.
