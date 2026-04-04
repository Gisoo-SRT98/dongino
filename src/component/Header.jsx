import React from "react";

export default function Header() {
  return (
    <header>
      <HeadProps title="عنوان صفحه" icon="✌️" />
    </header>
  );
}

function HeadProps({ title, icon, children }) {
  return (
    <div className="flex aligns-center justify-between">
      {icon && <span>{icon}</span>}
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}
