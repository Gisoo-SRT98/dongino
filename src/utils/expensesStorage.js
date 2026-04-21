const STORAGE_KEY = "dong_expenses_v1";

export function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function addExpense(expense) {
  const expenses = loadExpenses();
  const next = [expense, ...expenses];
  saveExpenses(next);
  return next;
}

export function deleteExpensesByGroupId(groupId) {
  const expenses = loadExpenses();
  const next = expenses.filter((e) => e?.groupId !== groupId);
  saveExpenses(next);
  return next;
}

export function loadMyExpenses(userId) {
  return loadExpenses().filter((e) => e?.createdBy === userId);
}

