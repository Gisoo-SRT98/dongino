import useGroupStore from "../store/useGroupStore";

export default function GroupName() {

    const groupName = useGroupStore((state) => state.groupName);
    const setGroupName = useGroupStore((state) => state.setGroupName);

    return (
        <div className="border border-gray-200 rounded-xl p-4 text-right flex flex-col gap-2">
            <label className="font-normal">   
                اسم گروه
                <span className="text-red-500 font-bold"> *</span>
                <span className="font-bold">{groupName}</span>
            </label>
                <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="اسم گروه را وارد کنید"
                    className="border border-gray-200 rounded-md p-1 text-right text-gray-500 text-sm"
                />
           
        </div>
    )
}

