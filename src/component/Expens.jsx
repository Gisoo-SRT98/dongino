import { useEffect, useRef, useState } from "react";
import useGroupStore from "../store/useGroupStore";

export default function Expenses() {
  const cost = useGroupStore((state) => state.cost);
  const setCost = useGroupStore((state) => state.setCost);
  const members = useGroupStore((state) => state.members);
  const splitEqual = useGroupStore((state) => state.splitEqual);
  const setSplitEqual = useGroupStore((state) => state.setSplitEqual);
  const memberDebts = useGroupStore((state) => state.memberDebts);
  const setMemberDebts = useGroupStore((state) => state.setMemberDebts);

  const [showInitialSplitModal, setShowInitialSplitModal] = useState(false);
  const [isCostConfirmed, setIsCostConfirmed] = useState(false);
  const popupTimeoutRef = useRef(null);

  useEffect(() => {
    if (cost === "" || Number(cost) <= 0) {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
        popupTimeoutRef.current = null;
      }
      setIsCostConfirmed(false);
      setSplitEqual(undefined);
      setMemberDebts([]);
    }
  }, [cost, setSplitEqual, setMemberDebts]);

  useEffect(() => {
    if (splitEqual === false) {
      const nextDebts = members.map((_, index) => memberDebts[index] ?? "");
      const shouldSyncDebts =
        nextDebts.length !== memberDebts.length ||
        nextDebts.some((value, index) => value !== memberDebts[index]);

      if (shouldSyncDebts) {
        setMemberDebts(nextDebts);
        return;
      }

      const allDebtsFilled =
        memberDebts.length === members.length &&
        memberDebts.every((d) => d !== "" && d !== undefined);
      if (allDebtsFilled) {
        const total = memberDebts.reduce((sum, d) => sum + Number(d || 0), 0);
        if (cost === "" || cost === undefined) {
          setCost(total);
        }
      }
    }
  }, [splitEqual, memberDebts, members, cost, setCost]);

  function normalizeDigitsToEnglish(raw) {
    return String(raw)
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  }

  function handleCostFocus() {
    if (splitEqual === undefined) {
      setShowInitialSplitModal(true);
    }
  }

  function handleInitialSplitChoice(equal) {
    setSplitEqual(equal);
    setShowInitialSplitModal(false);
    if (!equal) {
      setMemberDebts(members.map(() => ""));
    }
  }

  function handleCostChange(e) {
    const v = normalizeDigitsToEnglish(e.target.value).trim();
    if (v === "") {
      setCost("");
      setIsCostConfirmed(false);
      return;
    }
    const onlyDigits = v.replace(/[^\d]/g, "");
    setCost(onlyDigits === "" ? "" : Number(onlyDigits));
    setIsCostConfirmed(false);
  }

  function handleConfirmCost() {
    const hasValidMembers =
      members.length > 0 && members.every((m) => m.trim() !== "");
    if (!hasValidMembers || cost === "" || Number(cost) <= 0) return;

    setIsCostConfirmed(true);
  }

  return (
    <>
      {showInitialSplitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--background)] border border-gray-200 p-6 text-right shadow-2xl">
            <p className="text-lg font-semibold mb-4">
              آیا هزینه به صورت مساوی بین اعضا تقسیم شود؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleInitialSplitChoice(true)}
                className="w-full rounded-xl bg-green-500 px-4 py-3 text-white transition hover:bg-green-600"
              >
                بله
              </button>
              <button
                onClick={() => handleInitialSplitChoice(false)}
                className="w-full rounded-xl bg-red-500 px-4 py-3 text-white transition hover:bg-red-600"
              >
                خیر
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-xl p-4 text-right">
        <label className="font-normal">
          هزینه
          <span className="text-red-500 font-bold"> *</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={cost}
            onChange={handleCostChange}
            onFocus={handleCostFocus}
            placeholder="0"
            className="flex-1 border border-gray-200 rounded-md p-2 text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleConfirmCost}
            className="inline-flex h-10 w-10 items-center justify-center bg-white text-gray-500 transition"
            aria-label="تایید هزینه و نمایش پنجره"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              viewBox="0 0 24 24"
              className={
                isCostConfirmed
                  ? "text-lime-500 border-2 border-lime-500 rounded-full p-1"
                  : "text-gray-500 rounded-full border-2 border-gray-200 "
              }
              stroke="currentColor"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.89163 13.2687L9.16582 17.5427L18.7085 8" />
            </svg>
          </button>
          {cost !== "" && Number(cost) > 0 && (
            <p className="text-right text-orange-500 font-bold">
              <span className="font-light">تومان</span> {cost}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
