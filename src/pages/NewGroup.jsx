import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Expenses from "../component/Expens";
import GroupName from "../component/GroupName";
import MemberLists from "../component/Members";
import useGroupStore from "../store/useGroupStore";
import { getGroup, createGroup, updateGroup } from "../services/pocketbase";
import Default from "../layout/Default";
import Back from "../component/Back";

export default function NewGroupPage() {
  const { groupName, groupId, cost, members, splitEqual, memberDebts } =
    useGroupStore();
  const setGroupId = useGroupStore((state) => state.setGroupId);
  const setGroupName = useGroupStore((state) => state.setGroupName);
  const setCost = useGroupStore((state) => state.setCost);
  const setMembers = useGroupStore((state) => state.setMembers);
  const setSplitEqual = useGroupStore((state) => state.setSplitEqual);
  const setMemberDebts = useGroupStore((state) => state.setMemberDebts);
  const resetGroup = useGroupStore((state) => state.resetGroup);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const editGroupId = location.state?.editGroupId;
    if (!editGroupId) return;

    const loadGroup = async () => {
      try {
        const group = await getGroup(editGroupId);
        if (!group) return;

        setGroupId(group.id);
        setGroupName(group.name || "");
        setCost(group.cost ?? "");
        setMembers(group.members || []);
        setSplitEqual(group.splitEqual);
        setMemberDebts(group.memberDebts || []);
      } catch (error) {
        console.error("خطا در بارگذاری گروه از PocketBase:", error);
      }
    };

    loadGroup();
  }, [
    location.state,
    setGroupId,
    setGroupName,
    setCost,
    setMembers,
    setSplitEqual,
    setMemberDebts,
  ]);

  const handleSaveGroup = async () => {
    setSaveError("");

    // Validation
    if (!groupName.trim()) {
      setSaveError("نام گروه را وارد کنید");
      return;
    }
    if (members.length === 0 || members.some((m) => !m.trim())) {
      setSaveError("تمام اعضا را وارد کنید");
      return;
    }
    if (cost === "" || Number(cost) <= 0) {
      setSaveError("هزینه را وارد کنید");
      return;
    }

    setIsSaving(true);
    try {
      const groupData = {
        name: groupName.trim(),
        cost: Number(cost),
        members,
        memberDebts:
          memberDebts.length > 0
            ? memberDebts.map((d) => Number(d) || 0)
            : members.map(() => Number(cost) / members.length),
        splitEqual: splitEqual ?? true,
      };

      if (groupId) {
        // Update existing group
        await updateGroup(groupId, groupData);
      } else {
        // Create new group
        await createGroup(groupData);
      }

      // Reset and navigate
      resetGroup();
      navigate("/my-groups");
    } catch (error) {
      console.error("خطا در ذخیره‌ی گروه:", error);
      setSaveError("خطا در ذخیره‌ی گروه: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Default>    
      <Back />
      {saveError && (
        <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm text-right border border-red-300">
          {saveError}
        </div>
      )}

      <GroupName />
      <MemberLists />
      <Expenses />

      <div className="absolute bottom-0 right-0 left-0 h-16 p-2 border-t border-gray-200 bg-[var(--background)] flex justify-around items-center z-10">
        <button
          onClick={handleSaveGroup}
          disabled={isSaving}
          className="w-full bg-orange-500 p-3 rounded-xl text-white"
        >
          {isSaving ? "در حال ذخیره‌ی گروه..." : "ذخیره گروه"}
        </button>
      </div>
    </Default>
  );
}
