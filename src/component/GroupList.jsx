import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGroupStore from "../store/useGroupStore";
import { deleteGroup, getGroups } from "../services/pocketbase";
import Button from "./Button";
import Default from "../layout/Default";
import Back from "./Back";

function ConfirmDeleteModal({ open, groupName, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      <div className="relative w-[92%] max-w-sm rounded-2xl bg-white p-4 shadow-xl text-right">
        <div className="font-bold">حذف گروه</div>
        <div className="mt-2 text-sm text-gray-700">
          مطمئنی گروه <span className="font-bold">{groupName}</span> حذف بشه؟
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded-xl"
          >
            انصراف
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

function SwipeToRevealDelete({ children, onDelete }) {
  const MAX_TRANSLATE = 88;
  const THRESHOLD = 40;

  const [translateX, setTranslateX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startTranslateX, setStartTranslateX] = useState(0);
  const [preventClick, setPreventClick] = useState(false);

  function handlePointerDown(e) {
    setDragging(true);
    setStartX(e.clientX);
    setStartTranslateX(translateX);
    setPreventClick(false);
  }

  function handlePointerMove(e) {
    if (!dragging) return;

    const delta = e.clientX - startX;
    if (Math.abs(delta) > 8) {
      setPreventClick(true);
    }

    const nextTranslateX = Math.max(
      Math.min(startTranslateX + delta, 0),
      -MAX_TRANSLATE,
    );

    setTranslateX(nextTranslateX);
  }

  function handlePointerUp() {
    setDragging(false);

    if (translateX < -THRESHOLD) {
      setTranslateX(-MAX_TRANSLATE);
    } else {
      setTranslateX(0);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-y-0 right-0 w-[88px] flex items-center justify-center bg-orange-500">
        <button
          onClick={onDelete}
          className="h-full w-full text-white font-bold"
        >
          حذف
        </button>
      </div>

      <div
        className="touch-pan-y select-none transition-transform duration-200"
        style={{ transform: `translateX(${translateX}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={(e) => {
          if (preventClick) {
            e.preventDefault();
            e.stopPropagation();
            setPreventClick(false);
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function GroupList() {
  const resetGroup = useGroupStore((state) => state.resetGroup);
  const setGroupId = useGroupStore((state) => state.setGroupId);
  const setGroupName = useGroupStore((state) => state.setGroupName);
  const setCost = useGroupStore((state) => state.setCost);
  const setMembers = useGroupStore((state) => state.setMembers);
  const navigate = useNavigate();

  const [groupDetails, setGroupDetails] = useState([]);

  function handleAddGroup() {
    setGroupDetails((prev) => [...prev, { name: "", expense: "", image: "" }]);
  }

  const [savedGroups, setSavedGroups] = useState([]);

  async function refreshGroups() {
    try {
      const groups = await getGroups();
      setSavedGroups(groups);
    } catch (error) {
      console.error("خطا در بارگذاری گروه‌ها:", error);
    }
  }

  function handleEditGroup(group) {
    setGroupId(group.id);
    setGroupName(group.name || "");
    setCost(group.cost ?? "");
    setMembers(group.members || []);
    navigate("/new-group", { state: { editGroupId: group.id } });
  }

  useEffect(() => {
    refreshGroups();
  }, []);

  const [pendingDeleteGroup, setPendingDeleteGroup] = useState(null);

  return (
    <Default>
        <div className="flex justify-between mb-4 justify-between items-center">
          <Back />
          <div>
            <h2 className="font-bold pb-3">لیست گروه‌ها</h2>
          </div>
        </div>
        <div className="overflow-auto flex flex-col gap-2 mb-20">
          {savedGroups.length > 0 ? (
            <ul className="flex flex-col gap-2 mb-16">
              {savedGroups.map((g) => (
                <li key={g.id}>
                  <SwipeToRevealDelete
                    onDelete={() =>
                      setPendingDeleteGroup({ id: g.id, name: g.name })
                    }
                  >
                    <div
                      className="border rounded-xl p-3 bg-[var(--background)] cursor-pointer border-gray-200 hover:border-gray-400 transition-colors"
                      onClick={() => handleEditGroup(g)}
                    >
                      <div className="flex flex-row-reverse justify-between">
                        <span className="font-bold">{g.name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(g.createdAt).toLocaleDateString("fa-IR")}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500">
                        هزینه: <b>{g.cost}</b> تومان
                      </div>

                      <div className="text-sm text-gray-500">
                        اعضا: <b>{g.members?.length || 0}</b>
                      </div>
                    </div>
                  </SwipeToRevealDelete>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-600">
              گروهی وجود ندارد. برای ساخت گروه جدید روی دکمه «ساخت گروه جدید»
              کلیک کنید.
            </div>
          )}
        </div>
        <div className="absolute bottom-[75px] left-1/2 -translate-x-1/2">
          <Button onClick={handleAddGroup}>
            <span className="text-4xl font-medium leading-none">+</span>
          </Button>
        </div>
   
      

      <ConfirmDeleteModal
        open={!!pendingDeleteGroup}
        groupName={pendingDeleteGroup?.name}
        onCancel={() => setPendingDeleteGroup(null)}
        onConfirm={async () => {
          try {
            await deleteGroup(pendingDeleteGroup.id);
          } catch (error) {
            console.error("خطا در حذف گروه از PocketBase:", error);
          }
          setPendingDeleteGroup(null);
          refreshGroups();
        }}
      />
    </Default>
  );
}
