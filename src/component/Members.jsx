import { useEffect, useRef, useState } from "react";
import useGroupStore from "../store/useGroupStore";

export default function MemberLists() {
  const groupName = useGroupStore((state) => state.groupName);
  const members = useGroupStore((state) => state.members);
  const addMember = useGroupStore((state) => state.addMember);
  const removeMember = useGroupStore((state) => state.removeMember);
  const updateMember = useGroupStore((state) => state.updateMember);
  const [showAddName, setShowAddName] = useState(true);
  const [showGroupNameAlert, setShowGroupNameAlert] = useState(false);
  const alertTimeoutRef = useRef(null);

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
        <ul>
          {showAddName && (
            <MemberName
              addMembers={members}
              updateMemberName={updateMemberName}
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
  onAddNewInput,
  onRemoveMember,
}) {
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
        </li>
      ))}
    </>
  );
}
