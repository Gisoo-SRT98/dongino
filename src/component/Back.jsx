import { useNavigate } from "react-router-dom";

export default function Back() {
    const navigate = useNavigate();
    return (
        <button
        onClick={() => navigate(-1)}
        className="self-start flex flex-row-reverse items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 group mb-4"
        >
        <span className="text-lg leading-none">🔙</span>
        بازگشت
        </button>
    )
}