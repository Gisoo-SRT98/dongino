import useGroupStore from "../store/useGroupStore";

export default function Expenses() {

    const cost = useGroupStore((state) => state.cost);
    const setCost = useGroupStore((state) => state.setCost);

    return (
        <>
            <div className="border border-gray-200 rounded-xl p-4 text-right flex flex-col gap-2">
                <label className="font-normal"> : هزینه</label>
                <div className="flex justify-between items-center">
                    <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(Number(e.target.value))}
                        placeholder="125000"
                        className="border border-gray-200 rounded-md p-1 text-gray-500"
                    />
                    {cost && 
                        <p className="text-right text-orange-500 font-bold"> <span className="font-light">تومان</span>  {cost} </p> 
                    }
                </div>
        </div>
        </>
    )
};