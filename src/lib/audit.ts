import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Record an admin action in the audit log. Never throws: a logging problem must
 * not undo or block the action itself (it is reported to the server log instead).
 *
 * @param action     e.g. 'product.update', 'telegram.approve'
 * @param entityType e.g. 'product', 'category', 'telegram_import', 'settings'
 */
export async function audit(
  action: string,
  entityType: string,
  entityId?: string | null,
  details: Record<string, unknown> = {},
  actorEmail?: string | null
): Promise<void> {
  try {
    const email = actorEmail ?? (await getAdminSession())?.email ?? null;
    await db.recordAudit({ admin_email: email, action, entity_type: entityType, entity_id: entityId ?? null, details });
  } catch (e) {
    console.error('Audit log write failed:', e instanceof Error ? e.message : e);
  }
}
