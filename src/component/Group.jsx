export default function Group({ group, index, groupDetails, setGroupDetails }) {
  function handleChange(field, value) {
    const updatedGroups = [...groupDetails];
    updatedGroups[index][field] = value;
    setGroupDetails(updatedGroups);
  }

  return (
    <li className="p-3 border border-gray-200 rounded-xl my-4">
      <div className="flex flex-col gap-5 aligns-start">

        <label className="text-right text-gray-500"> اسم گروه 
          <input
            type="text"
            placeholder="اسم گروه"
            value={group.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="p-2 rounded text-right border border-gray-200 rounded-xl w-full mt-2" 
          />
      </label>


        <input
          type="text"
          placeholder="لینک عکس"
          value={group.image}
          onChange={(e) => handleChange("image", e.target.value)}
          className="p-2 rounded border border-gray-200 text-right rounded-xl" />

        {group.image && (
          <img
            src={group.image}
            alt={group.name}
            className="w-12 h-12 rounded-full mt-2" />
        )}

        <label className="text-right text-gray-500"> واحد پول 
          <input
            type="number"
            placeholder="هزینه"
            value={group.expense}
            onChange={(e) => handleChange("expense", e.target.value)}
            className="p-2 rounded text-right border border-gray-200 rounded-xl w-full mt-2" 
          />
        </label>

      </div>
    </li>
  );
}
