import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGroupStore from "../store/useGroupStore";
import { createGroup, updateGroup } from "../services/pocketbase";

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
  const [showGroupNameAlert, setShowGroupNameAlert] = useState(false);
  const alertTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showGroupNameAlert) {
      alertTimeoutRef.current = setTimeout(() => {
        setShowGroupNameAlert(false);
      }, 5000);
    }

    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }
    };
  }, [showGroupNameAlert]);

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

  async function handleCreateGroup() {
    if (!groupName.trim()) {
      setShowGroupNameAlert(true);
      return;
    }
    const normalizedMembers = members.map((m) => m.trim()).filter(Boolean);

    const groupData = {
      name: groupName.trim(),
      cost: Number(cost) || 0,
      members: normalizedMembers,
      splitEqual,
      memberDebts,
    };

    try {
      if (groupId) {
        await updateGroup(groupId, groupData);
      } else {
        await createGroup(groupData);
      }
    } catch (error) {
      console.error("خطا در ذخیره گروه در PocketBase:", error);
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
      {showGroupNameAlert && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-800 font-medium">
                اسم گروه را وارد کنید
              </span>
            </div>
            <button
              onClick={() => setShowGroupNameAlert(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="بستن هشدار"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <button
            className="bg-orange-500 rounded-xl p-2 text-sm"
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
              placeholder=" مبلغ بدهی این عضو را وارد کنید"
              className="text-sm border-1 border-red-300 bg-red-50 text-red-700 text-sm w-full max-w-inherit p-2 rounded-xl text-right font-semibold"
            />
          )}
        </li>
      ))}
    </>
  );
}
