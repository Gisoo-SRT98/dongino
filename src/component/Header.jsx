import { useTheme } from "../ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="bg-[var(--background)] p-4 border-b border-gray-200 mb-4">
      <HeadProps title="" icon="" isDark={isDark}>
  
      </HeadProps>
    </header>
  );
}

function HeadProps({ title, icon, children, isDark }) {
  return (
    <div className="flex items-center justify-between">
      <img
        src={isDark ? "/DarkLogo.png" : "/LightLogo.png"}
        alt="Dongino Logo"
        className="h-10 w-18"
      />
      {icon && <span>{icon}</span>}
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}
