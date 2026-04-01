import { useNavigate } from "react-router-dom";
import Expenses from "../component/expens";
import GroupName from "../component/GroupName";
import MemberLists from "../component/Members";
import useGroupStore from "../store/useGroupStore";

export default function NewGroupPage() {

    const { groupName } = useGroupStore();
    const navigate = useNavigate();

    return (
        <div className="w-full max-w-md mx-auto min-h-screen relative p-2 shadow-xl flex flex-col gap-4">
            <button
                onClick={() => navigate(-1)}
                className="self-end flex flex-row-reverse items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 group"
            >
                <span className="text-lg leading-none">🔙</span>
                <span className="font-medium">بازگشت</span>
            </button>
            <GroupName />
            <Expenses />
            <MemberLists />
        </div>
    )

}
