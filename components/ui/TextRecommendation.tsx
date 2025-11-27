export default function TextRecommendation({ title, genre, synopsis }) {
  return (
    <div className="border border-[#222] rounded-lg p-4 bg-[#0f0f10]">
      <div className="text-white font-semibold">{title}</div>
      {genre && <div className="text-gray-400 text-sm mt-1">{genre}</div>}
      {synopsis && (
        <div className="text-gray-300 text-sm mt-2">{synopsis}</div>
      )}
    </div>
  );
}
