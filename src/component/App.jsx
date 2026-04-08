import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import GroupList from "./GroupList";
import NewGroupPage from "../pages/NewGroup";

export default function App() {
  const [view, setView] = useState("list");

  return (
    <div className="relative w-full max-w-md mx-auto h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="overflow-auto px-2">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setView("new")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            ساخت گروه جدید
          </button>
          <button
            onClick={() => setView("list")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            لیست گروه های من
          </button>
        </div>
        {view === "list" ? <GroupList /> : <NewGroupPage />}
      </main>
      <Footer />
    </div>
  );
}
