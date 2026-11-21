/**
 * Security Rules Verification Spec for Buletin SIB TOBURON
 * Verifies the "Dirty Dozen" adversarial payloads against firestore.rules invariants.
 */

export interface AdversarialCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'create' | 'update' | 'delete' | 'get' | 'list';
  actor: 'unauthenticated' | 'regular_verified_user' | 'unverified_admin_spoof' | 'verified_admin';
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
  enforcedByRule: string;
}

export const DIRTY_DOZEN_CASES: AdversarialCase[] = [
  {
    id: 1,
    name: 'Unauthenticated News Creation',
    collectionPath: '/news/attack-1',
    operation: 'create',
    actor: 'unauthenticated',
    payload: { title: 'Injected', status: 'published' },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'isVerifiedUser() && isAdmin()',
  },
  {
    id: 2,
    name: 'Unverified Admin Email Spoof',
    collectionPath: '/news/spoof-1',
    operation: 'create',
    actor: 'unverified_admin_spoof',
    payload: { title: 'Spoofed Admin Post', status: 'published' },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'request.auth.token.email_verified == true',
  },
  {
    id: 3,
    name: 'Self-Assigned Admin Escalation',
    collectionPath: '/admins/regular-uid-123',
    operation: 'create',
    actor: 'regular_verified_user',
    payload: { displayName: 'Attacker', role: 'admin', addedByUid: 'regular-uid-123' },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'allow create on /admins requires isAdmin()',
  },
  {
    id: 4,
    name: 'Shadow Ghost Field Injection',
    collectionPath: '/news/ghost-1',
    operation: 'create',
    actor: 'verified_admin',
    payload: {
      title: 'Valid Title',
      summary: 'Valid summary text here.',
      content: 'Valid full content body with more than twenty characters.',
      category: 'Pengumuman',
      imageUrl: '/src/assets/images/hero_sanctuary_worship_1795257467656.jpg',
      authorName: 'Sekretariat',
      authorUid: 'admin-uid',
      isFeatured: false,
      status: 'published',
      publishedDate: '2026-11-21',
      ghostPrivilege: true,
    },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'data.keys().hasOnly([...]) inside isValidNewsArticle()',
  },
  {
    id: 5,
    name: 'Path Variable ID Poisoning',
    collectionPath: '/news/bad id with spaces $$',
    operation: 'create',
    actor: 'verified_admin',
    payload: { title: 'Bad ID' },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'isValidId(newsId)',
  },
  {
    id: 6,
    name: 'Oversized Title Denial-of-Wallet',
    collectionPath: '/schedules/oversized-1',
    operation: 'create',
    actor: 'verified_admin',
    payload: { title: 'A'.repeat(5000) },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'data.title.size() <= 120 in isValidChurchSchedule()',
  },
  {
    id: 7,
    name: 'Forged Backdated Timestamp',
    collectionPath: '/gallery/forged-time-1',
    operation: 'create',
    actor: 'verified_admin',
    payload: { createdAt: '1999-01-01T00:00:00Z', updatedAt: '1999-01-01T00:00:00Z' },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'incoming().createdAt == request.time && incoming().updatedAt == request.time',
  },
  {
    id: 8,
    name: 'Author UID Spoofing on Create',
    collectionPath: '/news/spoof-author-1',
    operation: 'create',
    actor: 'verified_admin',
    payload: { authorUid: 'other-admin-uid' },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'incoming().authorUid == request.auth.uid',
  },
  {
    id: 9,
    name: 'Immutable createdAt Tampering on Update',
    collectionPath: '/news/existing-doc-1',
    operation: 'update',
    actor: 'verified_admin',
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'incoming().createdAt == existing().createdAt',
  },
  {
    id: 10,
    name: 'Value Poisoning on Allowed Update Field',
    collectionPath: '/schedules/existing-sched-1',
    operation: 'update',
    actor: 'verified_admin',
    payload: { startTime: '99:99:INVALID', category: 'HackedCategory' },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'isValidChurchSchedule(incoming()) wraps allow update',
  },
  {
    id: 11,
    name: 'Unauthenticated Draft Scraping',
    collectionPath: '/news/draft-doc-1',
    operation: 'get',
    actor: 'unauthenticated',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: "resource.data.status == 'published'",
  },
  {
    id: 12,
    name: 'Non-Admin Reading Other Admin Record',
    collectionPath: '/admins/other-admin-uid',
    operation: 'get',
    actor: 'regular_verified_user',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'request.auth.uid == adminUid || isAdmin()',
  },
];
