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

export default function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addMemberOpen, setAddMemberOpen] = useState(false);

  // New states for the requested features
  const [totalAmount, setTotalAmount] = useState("");
  const [memberShares, setMemberShares] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [isManualSplit, setIsManualSplit] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);

  async function refresh(isInitial = false) {
    if (!id) return;
    setError("");
    if (isInitial) setLoading(true);
    try {
      const g = await getGroup(id);
      if (!g) {
        setGroup(null);
        setExpenses([]);
        setError("گروه پیدا نشد.");
        return;
      }
      setGroup(g);
      setGroupName(g.name || "");
      const ex = await getExpenses({ groupId: id });
      setExpenses(ex);

      // Initialize memberShares from group members if not already set or if it's initial load
      const members = Array.isArray(g.members) ? g.members.filter(Boolean) : [];
      if (isInitial || memberShares.length === 0) {
        setMemberShares(members.map((m) => ({ name: m, share: "", selected: true })));
        if (members.length > 0 && !paidBy) setPaidBy(members[0]);
      } else {
        // Merge existing shares with new members list
        setMemberShares((prev) => {
          const next = members.map((m) => {
            const existing = prev.find((p) => p.name === m);
            return existing ? existing : { name: m, share: "", selected: true };
          });
          return next;
        });
      }
    } catch (e) {
      setError(e?.message || "خطا در دریافت اطلاعات گروه");
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  useEffect(() => {
    refresh(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Automatic split calculation when totalAmount changes
  useEffect(() => {
    if (isManualSplit) return;
    const total = Number(totalAmount) || 0;
    const selectedMembers = memberShares.filter((m) => m.selected);
    
    if (total <= 0) {
      setMemberShares((prev) => prev.map((m) => ({ ...m, share: "" })));
      return;
    }
    if (selectedMembers.length === 0) return;

    const base = Math.floor(total / selectedMembers.length);
    let rem = total - base * selectedMembers.length;

    setMemberShares((prev) =>
      prev.map((m) => {
        if (!m.selected) return { ...m, share: "" };
        const extra = rem > 0 ? 1 : 0;
        if (rem > 0) rem -= 1;
        return { ...m, share: String(base + extra) };
      }),
    );
  }, [totalAmount, memberShares.length, isManualSplit, memberShares.filter(m => m.selected).length]);

  const members = Array.isArray(group?.members) ? group.members.filter(Boolean) : [];

  const balances = useMemo(() => {
    return computeBalancesForGroupMembers(members, expenses);
  }, [members, expenses]);

  const totalShares = useMemo(() => {
    return memberShares
      .filter((m) => m.selected)
      .reduce((sum, m) => sum + (Number(m.share) || 0), 0);
  }, [memberShares]);

  const difference = useMemo(() => {
    const total = Math.floor(Number(totalAmount) || 0);
    return total - Math.floor(totalShares);
  }, [totalAmount, totalShares]);

  const handleUpdateGroupName = async (newName) => {
    setGroupName(newName);
    if (group) {
      try {
        await updateGroup(group.id, { name: newName });
      } catch (e) {
        console.error("Failed to update group name", e);
      }
    }
  };

  const handleUpdateMemberName = async (index, newName) => {
    const nextShares = [...memberShares];
    nextShares[index].name = newName;
    setMemberShares(nextShares);

    // Also update the group members in DB
    if (group) {
      const nextMembers = nextShares.map((m) => m.name);
      try {
        const updated = await updateGroup(group.id, { members: nextMembers });
        setGroup(updated);
      } catch (e) {
        console.error("Failed to update member name", e);
      }
    }
  };

  const handleUpdateMemberShare = (index, newShare) => {
    setIsManualSplit(true);
    const nextShares = [...memberShares];
    const v = normalizeDigitsToEnglish(newShare).trim();
    const onlyDigits = v.replace(/[^\d]/g, "");
    nextShares[index].share = onlyDigits === "" ? "" : onlyDigits;
    setMemberShares(nextShares);
  };

  const handleCalculateEqualSplit = () => {
    setIsManualSplit(false);
    const total = Number(totalAmount) || 0;
    const selectedMembers = memberShares.filter((m) => m.selected);
    if (total <= 0 || selectedMembers.length === 0) return;

    const base = Math.floor(total / selectedMembers.length);
    let rem = total - base * selectedMembers.length;

    const nextShares = memberShares.map((m) => {
      if (!m.selected) return { ...m, share: "" };
      const extra = rem > 0 ? 1 : 0;
      if (rem > 0) rem -= 1;
      return { ...m, share: String(base + extra) };
    });
    setMemberShares(nextShares);
  };

  const handleRegisterExpense = async () => {
    const selectedMembers = memberShares.filter((m) => m.selected);
    const amountNum = Number(totalAmount) || 0;
    
    if (!id || amountNum <= 0 || selectedMembers.length === 0 || savingExpense) {
      console.log("Validation failed:", { id, amountNum, selectedCount: selectedMembers.length, savingExpense });
      return;
    }
    
    if (difference !== 0) {
      console.log("Difference is not zero:", difference);
      setError(`مجموع سهم‌ها با مبلغ کل ${formatToman(Math.abs(difference))} تومان اختلاف دارد.`);
      return;
    }

    setSavingExpense(true);
    try {
      const participants = selectedMembers.map((m) => m.name);
      const splits = {};
      selectedMembers.forEach((m) => {
        const shareNum = Number(m.share) || 0;
        splits[m.name] = shareNum;
      });

      console.log("Saving expense with payload:", {
        groupId: id,
        amount: amountNum,
        paidBy: paidBy || participants[0],
        participants,
        splits,
      });

      await createExpense({
        groupId: id,
        amount: String(amountNum),
        paidBy: paidBy || participants[0],
        participants,
        splits,
      });

      navigate("/my-groups");
    } catch (e) {
      console.error("Error saving expense:", e);
      setError(e?.message || "خطا در ثبت هزینه");
      setSavingExpense(false);
    }
  };

  const toggleParticipant = (index) => {
    setIsManualSplit(false);
    const nextShares = [...memberShares];
    nextShares[index].selected = !nextShares[index].selected;
    setMemberShares(nextShares);
  };

  return (
    <Default>
      <div className="flex justify-between mb-4 items-center">
        <Back />
        <div className="text-right flex-1 px-4">
          <input
            type="text"
            value={groupName}
            onChange={(e) => handleUpdateGroupName(e.target.value)}
            className="font-bold text-lg bg-transparent border-none focus:ring-0 text-right w-full"
            placeholder="نام گروه"
          />
          <div className="text-xs text-gray-500">
            {members.length} عضو · {expenses.length} هزینه
          </div>
        </div>
        <button
          type="button"
          className="text-sm text-blue-600 underline whitespace-nowrap"
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
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-lg">اعضای گروه</div>
              <button
                type="button"
                className="px-3 py-2 bg-orange-500 text-white rounded-xl text-sm"
                onClick={() => setAddMemberOpen(true)}
              >
                افزودن عضو
              </button>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">مبلغ کل برای تقسیم</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={totalAmount}
                    onChange={(e) => {
                      const v = normalizeDigitsToEnglish(e.target.value).trim();
                      const onlyDigits = v.replace(/[^\d]/g, "");
                      setTotalAmount(onlyDigits === "" ? "" : onlyDigits);
                    }}
                    placeholder="مبلغ کل (مثلاً 200,000)"
                    className="flex-1 border border-gray-200 rounded-xl p-3 text-sm text-right focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button
                    onClick={handleCalculateEqualSplit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm whitespace-nowrap"
                  >
                    تقسیم مساوی
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">پرداخت‌کننده</label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm text-right bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {memberShares.map((m, i) => (
                    <option key={i} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {memberShares.length === 0 ? (
              <div className="mt-3 text-sm text-gray-500">
                هنوز عضوی اضافه نشده.
              </div>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {memberShares.map((m, index) => {
                  const net = balances.get(m.name) ?? 0;
                  return (
                    <li
                      key={index}
                      className={`flex flex-col gap-2 rounded-xl border p-3 transition-colors ${m.selected ? "border-orange-200 bg-orange-50/30" : "border-gray-200 bg-white"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="checkbox"
                          checked={m.selected}
                          onChange={() => toggleParticipant(index)}
                          className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => handleUpdateMemberName(index, e.target.value)}
                          className={`flex-1 border-none p-0 text-sm font-semibold focus:ring-0 bg-transparent ${m.selected ? "text-gray-800" : "text-gray-400"}`}
                          placeholder="نام عضو"
                        />
                        <span
                          className={
                            net > 0
                              ? "text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"
                              : net < 0
                                ? "text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg"
                                : "text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg"
                          }
                          dir="ltr"
                        >
                          <span className="text-[10px] ml-1 opacity-70">وضعیت فعلی:</span>
                          {net === 0 ? "0" : `${net > 0 ? "+" : "-"}${formatToman(net)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs whitespace-nowrap ${m.selected ? "text-gray-500" : "text-gray-300"}`}>سهم:</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={m.share}
                          disabled={!m.selected}
                          onChange={(e) => handleUpdateMemberShare(index, e.target.value)}
                          className={`flex-1 border border-gray-100 rounded-lg px-3 py-2 text-sm text-left ${m.selected ? "bg-white" : "bg-gray-50 text-gray-300"}`}
                          dir="ltr"
                          placeholder="0"
                        />
                        <span className={`text-xs ${m.selected ? "text-gray-400" : "text-gray-200"}`}>تومان</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">اختلاف / مانده:</span>
                <span
                  className={`text-lg font-bold ${difference === 0 ? "text-emerald-600" : "text-red-600"}`}
                  dir="ltr"
                >
                  {formatToman(Math.abs(difference))} تومان
                  {difference > 0 ? " (کمبود)" : difference < 0 ? " (اضافه)" : ""}
                </span>
              </div>
              <button
                onClick={handleRegisterExpense}
                disabled={Number(totalAmount) <= 0 || memberShares.filter(m => m.selected).length === 0 || savingExpense}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingExpense ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    در حال ثبت...
                  </>
                ) : (
                  "ثبت هزینه"
                )}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-[var(--background)] p-4 mb-20 text-right">
            <div className="font-bold mb-3 text-lg">تاریخچه هزینه‌ها</div>
            {expenses.length === 0 ? (
              <div className="text-sm text-gray-500">
                هنوز هزینه‌ای ثبت نشده است.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {expenses.map((ex) => (
                  <li
                    key={ex.id}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-gray-700">
                        پرداخت‌کننده: <b className="text-orange-600">{ex.paidBy || "—"}</b>
                      </div>
                      <div className="text-base font-bold text-gray-900" dir="ltr">
                        {formatToman(ex.amount)} <span className="text-xs font-normal text-gray-500">تومان</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-50 pt-2 mt-2">
                      <div className="text-xs text-gray-500 mb-1">سهم شرکا:</div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {(ex.participants || []).map((p) => {
                          let share = 0;
                          if (ex.splits) {
                            if (Array.isArray(ex.splits)) {
                              const item = ex.splits.find(s => s.name === p);
                              share = item ? item.amount : 0;
                            } else {
                              share = ex.splits[p] || 0;
                            }
                          } else {
                            share = ex.amount / (ex.participants.length || 1);
                          }
                          return (
                            <div key={p} className="text-xs bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                              <span className="text-gray-600">{p}:</span>{" "}
                              <span className="font-medium text-gray-800" dir="ltr">{formatToman(share)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-400">
                      {new Date(ex.createdAt).toLocaleDateString("fa-IR")} - {new Date(ex.createdAt).toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' })}
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
          await refresh();
        }}
      />
    </Default>
  );
}

