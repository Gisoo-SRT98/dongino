export default function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center bg-orange-600 text-white text-4xl w-14 h-14 rounded-full"
    >
      {children}
    </button>
  );
}
