/**
 * سهم هر عضو از هزینهٔ گروه (تومان).
 * فرض: ایجادکنندهٔ گروه کل صورت‌حساب را پرداخت کرده؛ ماندهٔ مثبت یعنی طلبکار، منفی یعنی بدهکار.
 */

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function getPerMemberShares(group) {
  const members = Array.isArray(group?.members) ? group.members : [];
  const n = members.length;
  const cost = num(group?.cost);
  if (n === 0 || cost <= 0) return [];

  const rawDebts = Array.isArray(group?.memberDebts) ? group.memberDebts : [];

  if (rawDebts.length === n && rawDebts.every((d) => d !== "" && d !== undefined)) {
    return rawDebts.map((d) => num(d));
  }

  const base = Math.floor(cost / n);
  let remainder = cost - base * n;
  const shares = [];
  for (let i = 0; i < n; i += 1) {
    let s = base;
    if (remainder > 0) {
      s += 1;
      remainder -= 1;
    }
    shares.push(s);
  }
  return shares;
}

function normalizeName(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
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
 * مانده برای کاربر فعال: مثبت = طلبکار، منفی = بدهکار، ۰ = خنثی / نامشخص
 */
export function getUserNetBalanceInGroup(group, activeUserId, user) {
  const cost = num(group?.cost);
  const payerId = group?.createdBy ?? activeUserId;
  const isPayer = payerId === activeUserId;
  const members = Array.isArray(group?.members) ? group.members : [];
  let idx = findMemberIndexForUser(members, user);

  if (idx < 0 && isPayer && members.length > 0) {
    idx = 0;
  }

  const shares = getPerMemberShares(group);
  const share = idx >= 0 && idx < shares.length ? shares[idx] : 0;

  if (!isPayer && idx < 0) return 0;

  if (isPayer) {
    return cost - share;
  }
  return -share;
}

export function formatToman(n) {
  const v = Math.round(Math.abs(n));
  return v.toLocaleString("fa-IR");
}

export function summarizeUserAcrossGroups(groups, activeUserId, user) {
  let totalDebt = 0;
  let totalCredit = 0;

  for (const g of groups || []) {
    const net = getUserNetBalanceInGroup(g, activeUserId, user);
    if (net < 0) totalDebt += -net;
    else if (net > 0) totalCredit += net;
  }

  return { totalDebt, totalCredit };
}
