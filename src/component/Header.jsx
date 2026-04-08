import { useTheme } from "../ThemeContext";

export default function Header() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-[var(--background)] p-4">
      <HeadProps title="عنوان صفحه" icon="✌️">
        <button
          onClick={toggleTheme}
          className="bg-transparent border-none text-xl cursor-pointer p-1 rounded hover:bg-[var(--hover)]"
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </HeadProps>
    </header>
  );
}

function HeadProps({ title, icon, children }) {
  return (
    <div className="flex items-center justify-between">
      {icon && <span>{icon}</span>}
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}
