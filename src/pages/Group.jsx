import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Default from "../layout/Default";
import Back from "../component/Back";
import {
  createExpense,
  getExpenses,
  getGroup,
  updateGroup,
} from "../services/pocketbase";
import {
  computeBalancesForGroupMembers,
  formatToman,
} from "../utils/groupBalances";

function normalizeDigitsToEnglish(raw) {
  return String(raw)
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function AddMemberModal({ open, onClose, onSave }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setError("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-[92%] max-w-sm rounded-2xl bg-white p-4 shadow-xl text-right">
        <div className="font-bold">افزودن عضو جدید</div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="block text-sm text-gray-700 mt-3 mb-2">
          نام عضو
          <span className="text-red-500 font-bold"> *</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl p-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="مثلاً علی"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-xl"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={() => {
              const n = String(name || "").trim();
              if (!n) {
                setError("نام عضو را وارد کنید.");
                return;
              }
              onSave(n);
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl"
          >
            افزودن
          </button>
        </div>
      </div>
    </div>
  );
}

function AddExpenseModal({ open, members, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [participants, setParticipants] = useState([]);
  const [splits, setSplits] = useState({});
  const [dirty, setDirty] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function computeEqualSplits(total, names) {
    const safeTotal = Number(total);
    const n = Array.isArray(names) ? names.filter(Boolean) : [];
    if (!Number.isFinite(safeTotal) || safeTotal <= 0 || n.length === 0) return {};

    const base = Math.floor(safeTotal / n.length);
    let rem = safeTotal - base * n.length;
    const out = {};
    for (const name of n) {
      const extra = rem > 0 ? 1 : 0;
      if (rem > 0) rem -= 1;
      out[name] = base + extra;
    }
    return out;
  }

  function sumSplits(obj, names) {
    let s = 0;
    for (const name of names || []) {
      const v = Number(obj?.[name]);
      if (Number.isFinite(v)) s += v;
    }
    return s;
  }

  useEffect(() => {
    if (!open) return;
    const first = (members || []).find(Boolean) || "";
    setAmount("");
    setPaidBy(first);
    const initialParticipants = (members || []).filter(Boolean);
    setParticipants(initialParticipants);
    setDirty(new Set());
    setSplits({});
    setSaving(false);
    setError("");
  }, [open, members]);

  useEffect(() => {
    if (!open) return;
    const total = Number(amount);
    const selected = participants || [];
    if (!Number.isFinite(total) || total <= 0 || selected.length === 0) {
      setSplits({});
      return;
    }

    setSplits((prev) => {
      const next = {};

      // keep dirty values
      let fixedSum = 0;
      for (const name of selected) {
        if (dirty.has(name)) {
          const v = Number(prev?.[name]);
          const safe = Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
          next[name] = safe;
          fixedSum += safe;
        }
      }

      const free = selected.filter((n) => !dirty.has(n));
      const remaining = Math.max(0, Math.floor(total) - fixedSum);
      if (free.length > 0) {
        const base = Math.floor(remaining / free.length);
        let rem = remaining - base * free.length;
        for (const name of free) {
          const extra = rem > 0 ? 1 : 0;
          if (rem > 0) rem -= 1;
          next[name] = base + extra;
        }
      }

      return next;
    });
  }, [amount, participants, dirty, open]);

  const canSubmit = useMemo(() => {
    const n = Number(amount);
    const selected = participants || [];
    const total = Number.isFinite(n) ? Math.floor(n) : 0;
    const sum = sumSplits(splits, selected);
    return (
      Number.isFinite(n) &&
      n > 0 &&
      String(paidBy || "").trim() !== "" &&
      selected.length > 0 &&
      sum === total &&
      !saving
    );
  }, [amount, paidBy, participants, saving, splits]);

  function toggleParticipant(name) {
    setParticipants((prev) => {
      const next = prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name];
      return next;
    });
    setDirty((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      return next;
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-[92%] max-w-sm rounded-2xl bg-white p-4 shadow-xl text-right">
        <div className="font-bold">افزودن هزینه</div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="block text-sm text-gray-700 mt-3 mb-2">
          مبلغ کل
          <span className="text-red-500 font-bold"> *</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={amount}
          onChange={(e) => {
            const v = normalizeDigitsToEnglish(e.target.value).trim();
            const onlyDigits = v.replace(/[^\d]/g, "");
            setAmount(onlyDigits === "" ? "" : String(Number(onlyDigits)));
          }}
          placeholder="مثلاً 200000"
          className="w-full border border-gray-200 rounded-xl p-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <label className="block text-sm text-gray-700 mt-3 mb-2">
          پرداخت‌کننده
          <span className="text-red-500 font-bold"> *</span>
        </label>
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full border border-gray-200 rounded-xl p-3 text-gray-700 text-sm bg-white"
        >
          {(members || []).filter(Boolean).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <div className="mt-4">
          <div className="text-sm text-gray-700 mb-2">
            شرکای هزینه (Participants)
            <span className="text-red-500 font-bold"> *</span>
          </div>
          <div className="max-h-44 overflow-auto rounded-xl border border-gray-200 p-2">
            {(members || []).length === 0 ? (
              <div className="text-sm text-gray-500 p-2">عضوی وجود ندارد</div>
            ) : (
              <ul className="flex flex-col gap-1">
                {(members || []).filter(Boolean).map((m) => {
                  const checked = participants.includes(m);
                  return (
                    <li key={m}>
                      <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-lg hover:bg-gray-50">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleParticipant(m)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm text-gray-800">{m}</span>
                        </label>

                        {checked ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={String(splits?.[m] ?? "")}
                            onChange={(e) => {
                              const v = normalizeDigitsToEnglish(e.target.value).trim();
                              const onlyDigits = v.replace(/[^\d]/g, "");
                              const nextValue =
                                onlyDigits === "" ? "" : String(Number(onlyDigits));
                              setSplits((prev) => ({
                                ...prev,
                                [m]: nextValue === "" ? 0 : Number(nextValue),
                              }));
                              setDirty((prev) => {
                                const next = new Set(prev);
                                next.add(m);
                                return next;
                              });
                            }}
                            className="w-28 border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 text-left"
                            dir="ltr"
                            placeholder="سهم"
                          />
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded-xl bg-gray-200 text-sm"
            onClick={() => {
              setDirty(new Set());
              const total = Number(amount);
              setSplits(computeEqualSplits(total, participants));
            }}
          >
            تقسیم مساوی
          </button>
          <div className="text-xs text-gray-600" dir="ltr">
            جمع سهم‌ها: {formatToman(sumSplits(splits, participants))} /{" "}
            {formatToman(Number(amount) || 0)}
          </div>
        </div>

        {Number(amount) > 0 &&
          participants.length > 0 &&
          sumSplits(splits, participants) !== Math.floor(Number(amount)) && (
            <div className="mt-2 text-xs text-red-600">
              جمع سهم‌ها باید دقیقاً برابر «مبلغ کل» باشد تا ثبت انجام شود.
            </div>
          )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={async () => {
            setError("");
            setSaving(true);
            try {
              await onSave({
                amount,
                paidBy,
                participants,
                splits,
              });
            } catch (e) {
              setError(e?.message || "خطا در ثبت هزینه");
            } finally {
              setSaving(false);
            }
          }}
          className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-3 text-white font-semibold disabled:opacity-50"
        >
          {saving ? "در حال ثبت..." : "ثبت هزینه"}
        </button>
      </div>
    </div>
  );
}

export default function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  async function refresh() {
    if (!id) return;
    setError("");
    setLoading(true);
    try {
      const g = await getGroup(id);
      if (!g) {
        setGroup(null);
        setExpenses([]);
        setError("گروه پیدا نشد.");
        return;
      }
      setGroup(g);
      const ex = await getExpenses({ groupId: id });
      setExpenses(ex);
    } catch (e) {
      setError(e?.message || "خطا در دریافت اطلاعات گروه");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const members = Array.isArray(group?.members) ? group.members.filter(Boolean) : [];

  const balances = useMemo(() => {
    return computeBalancesForGroupMembers(members, expenses);
  }, [members, expenses]);

  return (
    <Default>
      <div className="flex justify-between mb-4 justify-between items-center">
        <Back />
        <div className="text-right">
          <h2 className="font-bold pb-1">{group?.name || "گروه"}</h2>
          <div className="text-xs text-gray-500">
            {members.length} عضو · {expenses.length} هزینه
          </div>
        </div>
        <button
          type="button"
          className="text-sm text-blue-600 underline"
          onClick={() => navigate("/my-groups")}
        >
          لیست گروه‌ها
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 text-right">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500 text-right">در حال بارگذاری...</div>
      ) : (
        <>
          <div className="rounded-2xl border border-gray-200 bg-[var(--background)] p-4 mb-4 text-right">
            <div className="flex items-center justify-between">
              <div className="font-bold">اعضای گروه</div>
              <button
                type="button"
                className="px-3 py-2 bg-orange-500 text-white rounded-xl text-sm"
                onClick={() => setAddMemberOpen(true)}
              >
                افزودن عضو
              </button>
            </div>

            {members.length === 0 ? (
              <div className="mt-3 text-sm text-gray-500">
                هنوز عضوی اضافه نشده.
              </div>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {members.map((m) => {
                  const net = balances.get(m) ?? 0;
                  return (
                    <li
                      key={m}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2"
                    >
                      <span className="text-sm text-gray-800">{m}</span>
                      <span
                        className={
                          net > 0
                            ? "text-sm font-semibold text-emerald-600"
                            : net < 0
                              ? "text-sm font-semibold text-red-600"
                              : "text-sm text-gray-500"
                        }
                        dir="ltr"
                      >
                        {net === 0 ? "0" : `${net > 0 ? "+" : "-"}${formatToman(net)}`}{" "}
                        تومان
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-[var(--background)] p-4 mb-20 text-right">
            <div className="flex items-center justify-between">
              <div className="font-bold">هزینه‌ها</div>
              <button
                type="button"
                className="px-3 py-2 bg-blue-500 text-white rounded-xl text-sm"
                onClick={() => setAddExpenseOpen(true)}
                disabled={members.length === 0}
              >
                + افزودن هزینه
              </button>
            </div>

            {members.length === 0 ? (
              <div className="mt-3 text-sm text-gray-500">
                برای ثبت هزینه، اول حداقل یک عضو اضافه کنید.
              </div>
            ) : expenses.length === 0 ? (
              <div className="mt-3 text-sm text-gray-500">
                هنوز هزینه‌ای ثبت نشده.
              </div>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {expenses.map((ex) => (
                  <li
                    key={ex.id}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-3"
                  >
                    <div className="flex justify-between">
                      <div className="text-sm text-gray-700">
                        پرداخت‌کننده: <b>{ex.paidBy || "—"}</b>
                      </div>
                      <div className="text-sm font-bold" dir="ltr">
                        {formatToman(ex.amount)} تومان
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      شرکا: <b>{(ex.participants || []).length}</b>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <AddMemberModal
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        onSave={async (name) => {
          if (!group) return;
          const nextMembers = Array.from(
            new Set([...(group.members || []).filter(Boolean), name]),
          );
          const updated = await updateGroup(group.id, { members: nextMembers });
          setGroup(updated);
          setAddMemberOpen(false);
        }}
      />

      <AddExpenseModal
        open={addExpenseOpen}
        members={members}
        onClose={() => setAddExpenseOpen(false)}
        onSave={async ({ amount, paidBy, participants, splits }) => {
          await createExpense({
            groupId: id,
            amount,
            paidBy,
            participants,
            splits,
          });
          setAddExpenseOpen(false);
          await refresh();
        }}
      />
    </Default>
  );
}

