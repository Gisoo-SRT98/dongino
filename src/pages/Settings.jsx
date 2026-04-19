import Back from "../component/Back";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";
import Default from "../layout/Default";

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  return (
    <Default>
      <Back />

      <div className="bg-white dark:bg-[var(--card)] p-6 rounded-lg border border-gray-100 dark:border-[var(--border)]">
        <h1 className="text-xl font-bold mb-6 text-right">{t("settings")}</h1>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 font-medium"
            >
              {isDark ? t("light") : t("dark")}
            </button>
            <div className="text-right">
              <div className="font-semibold">{t("theme")}</div>
              <div className="text-xs text-gray-500">
                {isDark ? t("dark") : t("light")}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-[var(--border)]" />

          <div className="flex items-center justify-between gap-3">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--card)]"
            >
              <option value="fa">فارسی</option>
              <option value="en">English</option>
            </select>
            <div className="text-right">
              <div className="font-semibold">{t("language")}</div>
              <div className="text-xs text-gray-500">
                {lang === "fa" ? "فارسی" : "English"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Default>
  );
}

