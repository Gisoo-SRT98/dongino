import useGroupStore from "../store/useGroupStore";

export default function Expenses() {

    const cost = useGroupStore((state) => state.cost);
    const setCost = useGroupStore((state) => state.setCost);

    function normalizeDigitsToEnglish(raw) {
        return String(raw)
            .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
            .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
    }

    return (
        <>
            <div className="border border-gray-200 rounded-xl p-4 text-right flex flex-col gap-2">
                <label className="font-normal">
                    هزینه
                    <span className="text-red-500 font-bold"> *</span>
                </label>
                <div className="flex justify-between items-center">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={cost}
                        onChange={(e) => {
                            const v = normalizeDigitsToEnglish(e.target.value).trim();
                            if (v === "") return setCost("");
                            const onlyDigits = v.replace(/[^\d]/g, "");
                            setCost(onlyDigits === "" ? "" : Number(onlyDigits));
                        }}
                        placeholder="125000"
                        className="border border-gray-200 rounded-md p-1 text-gray-500"
                    />
                    {cost !== "" && Number(cost) > 0 && 
                        <p className="text-right text-orange-500 font-bold"> <span className="font-light">تومان</span>  {cost} </p> 
                    }
                </div>
        </div>
        </>
    )
};