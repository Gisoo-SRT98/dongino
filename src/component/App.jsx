import { useNavigate } from "react-router-dom";
import Default from "../layout/Default";
import { useLanguage } from "../LanguageContext";

export default function App() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
   
   <Default>
        <div className="flex flex-col gap-2 mb-4">
          <button
            onClick={() => navigate("/new-group")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            {t("newGroup")}
          </button>
          <button
            onClick={() => navigate("/my-groups")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            {t("myGroups")}
          </button>
        </div>
   </Default>
   
  );
}
