import useGroupStore from "../store/useGroupStore";
import { useState } from "react";
import Footer from "./Footer";
import GroupsLists  from "./GroupsLists";
import Header from "./Header";
import Button from "./Button";
import { Link } from "react-router-dom";


export default function App() {

  const groupName = useGroupStore((state) => state.groupName);
  const cost = useGroupStore((state) => state.cost);


  
  const [groupDetails, setGroupDetails] = useState([]);
  function handleAddGroup() {
    setGroupDetails((prev) => [
      ...prev, { name: "", expense: "", image: "" },
    ]);
  }

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

      <Link to="/new-group">
        <Button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
          +
        </Button>
      </Link>

      {groupName && 
        <div className="border border-gray-200 p-4 rounded-xl m-2 text-right">
          <h2>اسم گروه: <span className="font-bold">{groupName}</span></h2>
          <h3>
            هزینه: <span className="font-bold">{cost}</span> تومان
          </h3>
        </div>
      } 
      
      <Footer />
    </div>
  );
}




