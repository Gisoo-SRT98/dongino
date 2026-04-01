import useGroupStore from "../store/useGroupStore";
import { useState } from "react";
import Button from "./Button";

export default function MemberLists() {

    const groupName = useGroupStore((state) => state.groupName);
    const [addMembers, setAddMembers] = useState([]);
    const [showAddName, setShowAddName] = useState(true);
 
    // function handleGoHome() {
    //     navigate("/");
    // }
    // این فانکشن که بره به کدوم صفحه و اطلاعات رو ذخیره کنه رو همزمان تو ی فانکشن میت=نویسیم

    function handleCreateGroup() {
        if (!groupName.trim()) return;
        navigate("/");
    }
    
    function handleAddMember() {
        setAddMembers(prev => [...prev, ""]);
        console.log("testhandleAddMember");
        // مقدار قبلی آرایه اعضا رو بگیر و یه input خالی جدید به آخرش اضافه کن.
    }

    function handleRemoveMember(index) {
        setAddMembers(prev => prev.filter((_, i) => i !== index));
        console.log(handleRemoveMember);
    }

    function handleShowAddName() {
        setShowAddName((show) => !show)
    }

    function updateMemberName(index, value) {
        const updated = [...addMembers];
        updated[index] = value;
        setAddMembers(updated);
    }

    return (
        <>
            <div>
                <div className="flex justify-between">
                    <button 
                        className="text-base bg-orange-500 rounded-xl p-2" 
                        onClick={handleAddMember}
                    >
                        افزودن عضو
                    </button>
                    <span>اعضای گروه</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-right my-4">
                    {addMembers.map((name, i) => (
                        name && 
                        <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-xl">
                            {name}
                        </span>
                    ))}
                </div>
                <ul>
                    {showAddName && 
                        <MemberName 
                            addMembers={addMembers}
                            updateMemberName={updateMemberName}
                            handleShowAddName={handleShowAddName}
                            showAddName={showAddName}
                            onAddNewInput={handleAddMember}
                            onRemoveMember={handleRemoveMember}
                        />
                    }
                </ul>
            </div>
            <div className=" bottom-0 max-w-inherit h-16 border-t border-gray-200 flex items-center fixed">
                <button className="w-full bg-orange-500 p-2 rounded-xl" onClick={handleCreateGroup} >ساخت گروه</button>
            </div>
        </>
    ) 
}


function MemberName({addMembers, updateMemberName, onAddNewInput, onRemoveMember }){
    return (
        <>
            {addMembers.map((member, index) => (
                <li key={index} className="flex justify-between" >
                   <Button 
                        onClick={index === addMembers.length - 1 ? onAddNewInput : () => onRemoveMember(index)}
                    >
                        {index === addMembers.length - 1 ? "+" : "-"}
                    </Button> 
                    
                    <input 
                        type="text"
                        value={member}
                        onChange={(e)=> updateMemberName(index, e.target.value)}
                        className="border border-gray-200  w-full max-w-inherit m-4 p-2 rounded-xl text-right"
                        placeholder="اسم عضو جدید را وارد کنید"
                    />
                    <Button>{index}</Button>
                </li>
            ))}
       </>
    )
}