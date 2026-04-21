function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeName(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getExpenseSplits(expense) {
  const raw = expense?.splits;
  if (!raw) return null;

  if (Array.isArray(raw)) {
    const out = new Map();
    for (const item of raw) {
      const name = item?.name;
      const amount = num(item?.amount);
      if (!name) continue;
      out.set(name, amount);
    }
    return out.size ? out : null;
  }

  if (typeof raw === "object") {
    const out = new Map();
    for (const [name, amount] of Object.entries(raw)) {
      if (!name) continue;
      out.set(name, num(amount));
    }
    return out.size ? out : null;
  }

  return null;
}

/**
 * @param {string[]} members
 * @param {{ username?: string | null; email?: string | null } | null} user
 */
export function findMemberIndexForUser(members, user) {
  if (!Array.isArray(members) || members.length === 0) return -1;

  const candidates = [];
  if (user?.username) candidates.push(normalizeName(user.username));
  if (user?.email) candidates.push(normalizeName(user.email));

  for (let i = 0; i < members.length; i += 1) {
    const m = normalizeName(members[i]);
    if (!m) continue;
    for (const c of candidates) {
      if (c && m === c) return i;
    }
  }

  for (let i = 0; i < members.length; i += 1) {
    const m = normalizeName(members[i]);
    if (!m) continue;
    for (const c of candidates) {
      if (c && (m.includes(c) || c.includes(m))) return i;
    }
  }

  return -1;
}

/**
 * محاسبه بالانس اعضا بر اساس هزینه‌ها:
 * - share = amount / participantsCount
 * - payer: +amount - (isParticipant ? share : 0)
 * - participant (non-payer): -share
 * - non-participant: 0
 */
export function computeBalancesForGroupMembers(members, expenses) {
  const safeMembers = Array.isArray(members) ? members.filter(Boolean) : [];
  const balances = new Map();
  for (const m of safeMembers) balances.set(m, 0);

  for (const ex of expenses || []) {
    const amount = num(ex?.amount);
    if (amount <= 0) continue;

    const participants = Array.isArray(ex?.participants)
      ? ex.participants.filter(Boolean)
      : [];
    const count = participants.length;
    if (count <= 0) continue;

    const splits = getExpenseSplits(ex);
    if (splits) {
      for (const p of participants) {
        const prev = balances.get(p) ?? 0;
        const part = splits.get(p);
        balances.set(p, prev - num(part));
      }
    } else {
      const share = amount / count;
      for (const p of participants) {
        const prev = balances.get(p) ?? 0;
        balances.set(p, prev - share);
      }
    }

    const payer = ex?.paidBy;
    if (payer) {
      const payerPrev = balances.get(payer) ?? 0;
      const payerIsParticipant = participants.includes(payer);
      const payerShare = splits ? num(splits.get(payer)) : amount / count;
      balances.set(
        payer,
        payerPrev + amount - (payerIsParticipant ? payerShare : 0),
      );
    }
  }

  return balances;
}

export function getUserNetBalanceInGroup(group, expenses, user) {
  const members = Array.isArray(group?.members) ? group.members : [];
  const idx = findMemberIndexForUser(members, user);
  if (idx < 0) return 0;

  const balances = computeBalancesForGroupMembers(members, expenses);
  const memberName = members[idx];
  return balances.get(memberName) ?? 0;
}

export function formatToman(n) {
  const v = Math.round(Math.abs(n));
  return v.toLocaleString("fa-IR");
}

export function summarizeUserAcrossGroups(groups, expensesByGroupId, user) {
  let totalDebt = 0;
  let totalCredit = 0;

  for (const g of groups || []) {
    const expenses = expensesByGroupId?.get?.(g.id) || [];
    const net = getUserNetBalanceInGroup(g, expenses, user);
    if (net < 0) totalDebt += -net;
    else if (net > 0) totalCredit += net;
  }

  return { totalDebt, totalCredit };
}
