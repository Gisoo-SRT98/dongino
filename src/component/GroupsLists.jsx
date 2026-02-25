import  Button  from "./Button";
import  Group  from "./Group";

export default function GroupsLists({ groupDetails, setGroupDetails, onAddGroup }) {
  return (
    <div className="p-4">
      <ul>
        {groupDetails.map((group, index) => (
          <Group
            key={index}
            index={index}
            group={group}
            groupDetails={groupDetails}
            setGroupDetails={setGroupDetails} />
        ))}
      </ul>

      <div className="flex justify-center mt-6">
        <Button onClick={onAddGroup}>+</Button>
      </div>
    </div>
  );
}
