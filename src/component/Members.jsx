import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGroupStore from "../store/useGroupStore";
import Button from "./Button";
import { addGroup, updateGroup } from "../utils/groupsStorage";

export default function MemberLists() {
  const groupId = useGroupStore((state) => state.groupId);
  const groupName = useGroupStore((state) => state.groupName);
  const cost = useGroupStore((state) => state.cost);
  const splitEqual = useGroupStore((state) => state.splitEqual);
  const members = useGroupStore((state) => state.members);
  const memberDebts = useGroupStore((state) => state.memberDebts);
  const addMember = useGroupStore((state) => state.addMember);
  const removeMember = useGroupStore((state) => state.removeMember);
  const updateMember = useGroupStore((state) => state.updateMember);
  const updateMemberDebt = useGroupStore((state) => state.updateMemberDebt);
  const setMemberDebts = useGroupStore((state) => state.setMemberDebts);
  const resetGroup = useGroupStore((state) => state.resetGroup);
  const [showAddName, setShowAddName] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (splitEqual === false) {
      const nextDebts = members.map((_, index) => memberDebts[index] ?? "");
      const changed =
        nextDebts.length !== memberDebts.length ||
        nextDebts.some((value, index) => value !== memberDebts[index]);

      if (changed) setMemberDebts(nextDebts);
    } else if (splitEqual === true && memberDebts.length > 0) {
      setMemberDebts([]);
    }
  }, [members, splitEqual, memberDebts, setMemberDebts]);

  function normalizeDigitsToEnglish(raw) {
    return String(raw)
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  }

  function handleCreateGroup() {
    if (!groupName.trim()) return;
    const normalizedMembers = members.map((m) => m.trim()).filter(Boolean);

    const groupData = {
      id: groupId || crypto.randomUUID(),
      name: groupName.trim(),
      cost: Number(cost) || 0,
      members: normalizedMembers,
      splitEqual,
      memberDebts,
      createdAt: Date.now(),
    };

    if (groupId) {
      updateGroup(groupData);
    } else {
      addGroup(groupData);
    }

    resetGroup();
    navigate("/");
  }

  function handleAddMember() {
    addMember();
  }

  function handleRemoveMember(index) {
    removeMember(index);
  }

  function handleShowAddName() {
    setShowAddName((show) => !show);
  }

  function updateMemberName(index, value) {
    updateMember(index, value);
  }

  function handleDebtChange(index, rawValue) {
    const next = normalizeDigitsToEnglish(rawValue).trim();
    if (next === "") {
      updateMemberDebt(index, "");
      return;
    }
    const onlyDigits = next.replace(/[^\d]/g, "");
    updateMemberDebt(
      index,
      onlyDigits === "" ? "" : String(Number(onlyDigits)),
    );
  }

  return (
    <>
      <div className="border border-gray-200 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <button
            className="text-base bg-orange-500 rounded-xl p-2"
            onClick={handleAddMember}
          >
            افزودن عضو
          </button>
          <span>
            اعضای گروه
            <span className="text-red-500 font-bold"> *</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2 justify-right my-4">
          {members.map(
            (name, i) =>
              name && (
                <span
                  key={i}
                  className="bg-orange-100 text-orange-700 px-3 py-1 rounded-xl text-sm font-medium"
                >
                  {name}
                </span>
              ),
          )}
        </div>
        {splitEqual === true && members.length > 0 && (
          <p className="mb-3 text-sm text-green-700">
            هزینه به صورت مساوی بین اعضا تقسیم خواهد شد.
          </p>
        )}
        {splitEqual === false && members.length > 0 && (
          <p className="mb-3 text-sm text-red-700">
            برای هر عضو مبلغ بدهی را وارد کنید.
          </p>
        )}
        <ul>
          {showAddName && (
            <MemberName
              addMembers={members}
              updateMemberName={updateMemberName}
              splitEqual={splitEqual}
              cost={cost}
              memberDebts={memberDebts}
              onDebtChange={handleDebtChange}
              onAddNewInput={handleAddMember}
              onRemoveMember={handleRemoveMember}
            />
          )}
        </ul>
      </div>
      <div className="absolute bottom-0 right-0 left-0 h-16 p-2 border-t border-gray-200 bg-white flex justify-around items-center">
        <button
          className="w-full bg-orange-500 p-3 rounded-xl text-white"
          onClick={handleCreateGroup}
        >
          ساخت گروه
        </button>
      </div>
    </>
  );
}

function MemberName({
  addMembers,
  updateMemberName,
  splitEqual,
  cost,
  memberDebts,
  onDebtChange,
  onAddNewInput,
  onRemoveMember,
}) {
  const equalShare =
    addMembers.length > 0 ? Math.round(Number(cost) / addMembers.length) : 0;

  return (
    <>
      {addMembers.map((member, index) => (
        <li key={index} className="flex flex-col gap-2 py-2">
          <div className="flex items-center gap-2 ">
            <button
              onClick={
                index === addMembers.length - 1
                  ? onAddNewInput
                  : () => onRemoveMember(index)
              }
              className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center transition hover:bg-gray-300 font-bold"
            >
              {index === addMembers.length - 1 ? "+" : "-"}
            </button>

            <input
              type="text"
              value={member}
              onChange={(e) => updateMemberName(index, e.target.value)}
              className="border border-gray-200 text-gray-500 text-sm w-full max-w-inherit m-0 p-2 rounded-xl text-right"
              placeholder="اسم عضو جدید را وارد کنید"
            />
            <button className="rounded-md font-bold">{index + 1}</button>
          </div>

          {splitEqual === true && (
            <div className="text-right text-red-500 font-bold text-sm">
              مبلغ سهم: {equalShare.toLocaleString()} تومان
            </div>
          )}

          {splitEqual === false && (
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={memberDebts[index] ?? ""}
              onChange={(e) => onDebtChange(index, e.target.value)}
              placeholder="مبلغ بدهی (تومان)"
              className="border-2 border-red-300 bg-red-50 text-red-700 text-sm w-full max-w-inherit p-2 rounded-xl text-right font-semibold"
            />
          )}
        </li>
      ))}
    </>
  );
}
