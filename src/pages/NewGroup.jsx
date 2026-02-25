import Expenses from "../component/expens";
import GroupName from "../component/GroupName";
import MemberLists from "../component/Members";
import useGroupStore from "../store/useGroupStore";

export default function NewGroupPage() {

    const { groupName } = useGroupStore();

    return (
        <div className="w-full max-w-md mx-auto min-h-screen relative p-2 shadow-xl flex flex-col gap-4">
            <GroupName />
            <Expenses />
            <MemberLists />
        </div>
    )

}
