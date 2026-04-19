import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Default from "../layout/Default";
import { useLanguage } from "../LanguageContext";
import useUserStore from "../store/useUserStore";
import { getGroups, getActiveUserId } from "../services/pocketbase";
import {
  formatToman,
  summarizeUserAcrossGroups,
} from "../utils/groupBalances";

export default function App() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const user = useUserStore((s) => s.user);
  const [totals, setTotals] = useState({ totalDebt: 0, totalCredit: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const groups = await getGroups();
        const activeUserId = getActiveUserId();
        const next = summarizeUserAcrossGroups(groups, activeUserId, user);
        if (!cancelled) setTotals(next);
      } catch {
        if (!cancelled) setTotals({ totalDebt: 0, totalCredit: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <Default>
      <div className="rounded-2xl border border-gray-200 bg-[var(--background)] p-4 mb-4 text-right">
        <p className="text-sm font-semibold text-gray-600 mb-3">
          جمع از همهٔ گروه‌ها
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-3">
            <div className="text-xs text-red-700 font-medium">پرداختی شما</div>
            <div className="text-lg font-bold text-red-600 mt-1" dir="ltr">
              {formatToman(totals.totalDebt)}
            </div>
            <div className="text-xs text-red-600/80">تومان</div>
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-3">
            <div className="text-xs text-emerald-700 font-medium">طلب شما</div>
            <div className="text-lg font-bold text-emerald-600 mt-1" dir="ltr">
              {formatToman(totals.totalCredit)}
            </div>
            <div className="text-xs text-emerald-600/80">تومان</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <button
          onClick={() => navigate("/new-group")}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg"
        >
          {t("newGroup")}
        </button>
        <button
          onClick={() => navigate("/my-groups")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          {t("myGroups")}
        </button>
      </div>
    </Default>
  );
}
