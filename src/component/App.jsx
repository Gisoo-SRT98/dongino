import useGroupStore from "../store/useGroupStore";
import { useEffect, useState } from "react";
import Footer from "./Footer";
import GroupsLists  from "./GroupsLists";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { loadGroups } from "../utils/groupsStorage";


export default function App() {

  const resetGroup = useGroupStore((state) => state.resetGroup);
  const navigate = useNavigate();


  
  const [groupDetails, setGroupDetails] = useState([]);
  function handleAddGroup() {
    setGroupDetails((prev) => [
      ...prev, { name: "", expense: "", image: "" },
    ]);
  }

  const [savedGroups, setSavedGroups] = useState([]);
  function refreshGroups() {
    const groups = loadGroups()
      .slice()
      .sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0));
    setSavedGroups(groups);
  }

  useEffect(() => {
    refreshGroups();
  }, []);

  const [theme, setTheme] = useState("light");
  function handleUpdate() {
    setTheme(theme === 'light' ? 'dark': 'light');
  }


  return (
    <div 
      className= {
        ` w-full max-w-md mx-auto min-h-screen relative p-2 shadow-xl
        ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"} `
      }
    >
      <button 
        onClick={handleUpdate} 
        className= {`
          w-14 h-7 rounded-xl transition-colors duration-300
          ${theme === "light" ? "bg-gray-300" : "bg-orange-500"}
        `}> 

        <span
          className={`h-6 rounded-full transform transition-transform duration-300
            ${theme === "light" ? "translate-x-0" : "translate-x-7"}
          `}
        > {theme === 'light' ? '🔆' : '🔘'} </span> 

      </button>
      <Header />

      <GroupsLists
        groupDetails={groupDetails}
        setGroupDetails={setGroupDetails}
        onAddGroup={handleAddGroup} 
      />

      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold"
          onClick={() => {
            resetGroup();
            navigate("/new-group");
          }}
        >
          ساخت گروه جدید
        </button>
      </div>

      {savedGroups.length > 0 && (
        <div className="mt-4 border border-gray-200 rounded-xl p-3 text-right">
          <h2 className="font-bold mb-2">لیست گروه‌ها</h2>
          <ul className="flex flex-col gap-2">
            {savedGroups.map((g) => (
              <li
                key={g.id}
                className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold">{g.name}</span>
                  <span className="text-sm opacity-80">
                    {new Date(g.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
                <div className="text-sm opacity-90">
                  هزینه <span className="font-bold">{g.cost}</span> تومان
                </div>
                <div className="text-sm opacity-90">
                  اعضا: <span className="font-bold">{g.members?.length || 0}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Footer />
    </div>
  );
}




