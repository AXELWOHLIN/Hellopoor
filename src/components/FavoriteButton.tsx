"use client";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: () => void;
}

export default function FavoriteButton({
  isFavorite,
  onClick,
}: FavoriteButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
        isFavorite
          ? "text-red-500 hover:text-red-600"
          : "text-gray-300 hover:text-red-400"
      }`}
      aria-label={isFavorite ? "Ta bort fr\u00E5n favoriter" : "L\u00E4gg till i favoriter"}
    >
      <svg
        className="w-6 h-6"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
