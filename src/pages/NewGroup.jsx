import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Expenses from "../component/Expens";
import GroupName from "../component/GroupName";
import MemberLists from "../component/Members";
import useGroupStore from "../store/useGroupStore";
import { loadGroups } from "../utils/groupsStorage";

export default function NewGroupPage() {
  const { groupName } = useGroupStore();
  const setGroupId = useGroupStore((state) => state.setGroupId);
  const setGroupName = useGroupStore((state) => state.setGroupName);
  const setCost = useGroupStore((state) => state.setCost);
  const setMembers = useGroupStore((state) => state.setMembers);
  const setSplitEqual = useGroupStore((state) => state.setSplitEqual);
  const setMemberDebts = useGroupStore((state) => state.setMemberDebts);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const editGroupId = location.state?.editGroupId;
    if (!editGroupId) return;

    const group = loadGroups().find((item) => item.id === editGroupId);
    if (!group) return;

    setGroupId(group.id);
    setGroupName(group.name || "");
    setCost(group.cost ?? "");
    setMembers(group.members || []);
    setSplitEqual(group.splitEqual);
    setMemberDebts(group.memberDebts || []);
  }, [
    location.state,
    setGroupId,
    setGroupName,
    setCost,
    setMembers,
    setSplitEqual,
    setMemberDebts,
  ]);

  return (
    // <div className="w-full max-w-md mx-auto min-h-screen relative p-2 shadow-xl flex flex-col gap-4">
    <div className="relative w-full max-w-md mx-auto h-screen flex flex-col overflow-hidden p-2 flex flex-col gap-4">
      <button
        onClick={() => navigate(-1)}
        className="self-start flex flex-row-reverse items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 group"
      >
        <span className="text-lg leading-none">🔙</span>
        <span className="font-medium">بازگشت</span>
      </button>
      <div className="overflow-auto flex flex-col gap-2 mb-16">
        <GroupName />
        <MemberLists />
        <Expenses />
      </div>
    </div>
  );
}
