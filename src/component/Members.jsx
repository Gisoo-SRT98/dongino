import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGroupStore from "../store/useGroupStore";
import Button from "./Button";
import { addGroup, updateGroup } from "../utils/groupsStorage";

export default function MemberLists() {
  const groupId = useGroupStore((state) => state.groupId);
  const groupName = useGroupStore((state) => state.groupName);
  const cost = useGroupStore((state) => state.cost);
  const members = useGroupStore((state) => state.members);
  const addMember = useGroupStore((state) => state.addMember);
  const removeMember = useGroupStore((state) => state.removeMember);
  const updateMember = useGroupStore((state) => state.updateMember);
  const resetGroup = useGroupStore((state) => state.resetGroup);
  const [showAddName, setShowAddName] = useState(true);
  const navigate = useNavigate();

  // function handleGoHome() {
  //     navigate("/");
  // }
  // این فانکشن که بره به کدوم صفحه و اطلاعات رو ذخیره کنه رو همزمان تو ی فانکشن میت=نویسیم

  function handleCreateGroup() {
    if (!groupName.trim()) return;
    const normalizedMembers = members.map((m) => m.trim()).filter(Boolean);

    if (groupId) {
      updateGroup({
        id: groupId,
        name: groupName.trim(),
        cost: Number(cost) || 0,
        members: normalizedMembers,
      });
    } else {
      addGroup({
        id: crypto.randomUUID(),
        name: groupName.trim(),
        cost: Number(cost) || 0,
        members: normalizedMembers,
        createdAt: Date.now(),
      });
    }

    resetGroup();
    navigate("/");
  }

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
      <div>
        <div className="flex justify-between items-center">
          <button
            className="text-base bg-orange-500 rounded-xl p-2"
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
                  className="bg-orange-100 text-orange-700 px-3 py-1 rounded-xl"
                >
                  {name}
                </span>
              ),
          )}
        </div>
        <ul className="mb-[70px]">
          {showAddName && (
            <MemberName
              addMembers={members}
              updateMemberName={updateMemberName}
              handleShowAddName={handleShowAddName}
              showAddName={showAddName}
              onAddNewInput={handleAddMember}
              onRemoveMember={handleRemoveMember}
            />
          )}
        </ul>
      </div>
      <div className="fixed bottom-0 w-[433px] max-w-screen-md h-16 bg-white border-t border-gray-200 flex items-center px-4">
        <button
          className="w-full bg-orange-500 p-3 rounded-xl text-white"
          onClick={handleCreateGroup}
        >
          ساخت گروه
        </button>
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
        <li key={index} className="flex justify-between items-center">
          <Button
            onClick={
              index === addMembers.length - 1
                ? onAddNewInput
                : () => onRemoveMember(index)
            }
          >
            {index === addMembers.length - 1 ? "+" : "-"}
          </Button>

          <input
            type="text"
            value={member}
            onChange={(e) => updateMemberName(index, e.target.value)}
            className="border border-gray-200  w-full max-w-inherit m-4 p-2 rounded-xl text-right"
            placeholder="اسم عضو جدید را وارد کنید"
          />
          <button className="rounded-md font-bold">{index + 1}</button>
        </li>
      ))}
    </>
  );
}
