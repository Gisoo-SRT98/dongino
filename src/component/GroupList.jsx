import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGroupStore from "../store/useGroupStore";
import { deleteGroup, loadGroups } from "../utils/groupsStorage";

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

  function refreshGroups() {
    const groups = loadGroups()
      .slice()
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    setSavedGroups(groups);
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
    <div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            resetGroup();
            navigate("/new-group");
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-xl"
        >
          ساخت گروه جدید
        </button>
      </div>

      {savedGroups.length > 0 && (
        <div className="rounded-xl p-3 text-right">
          <h2 className="font-bold pb-3">لیست گروه‌ها</h2>

          <ul className="flex flex-col gap-2 mb-16">
            {savedGroups.map((g) => (
              <li key={g.id}>
                <SwipeToRevealDelete
                  onDelete={() =>
                    setPendingDeleteGroup({ id: g.id, name: g.name })
                  }
                >
                  <div
                    className="border rounded-xl p-3 bg-white cursor-pointer border-gray-200 hover:border-gray-400 transition-colors"
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
        </div>
      )}

      <ConfirmDeleteModal
        open={!!pendingDeleteGroup}
        groupName={pendingDeleteGroup?.name}
        onCancel={() => setPendingDeleteGroup(null)}
        onConfirm={() => {
          deleteGroup(pendingDeleteGroup.id);
          setPendingDeleteGroup(null);
          refreshGroups();
        }}
      />
    </div>
  );
}
