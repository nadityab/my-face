import React from "react";
import { Image } from "antd";
import useCreatePost from "../hooks/useCreatePost";

const CreatePostBox = ({ api, fetchAllTodos }) => {
  const {
    text,
    setText,
    images,
    removeImage,
    isLoading,
    handleImageChange,
    submitPost,
  } = useCreatePost(api, fetchAllTodos);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitPost();
  };

  // ✅ Komentar sudah dipindah ke luar return agar tidak error
  // --- FORM TAMBAH POST (CAROUSEL EDITION) ---
  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 bg-white p-3 sm:p-4 rounded-xl shadow-sm flex flex-col gap-3 mx-2 sm:mx-0 overflow-hidden"
    >
      <div className="flex gap-2 items-center w-full min-w-0">
        <div className="grow shrink min-w-0 basis-0">
          <textarea
            id="main-post-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Apa yang kamu pikirkan?"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none overflow-hidden custom-scrollbar"
            rows={1}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
        </div>
        <div className="shrink-0 flex items-center gap-1 sm:gap-2">
          <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
            <input
              id="imageInput"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </label>
          <button
            type="submit"
            disabled={isLoading || (!text.trim() && images.length === 0)}
            className={`shrink-0 text-white px-4 sm:px-6 py-2 rounded-full font-bold transition-all shadow-md text-xs sm:text-sm whitespace-nowrap ${
              isLoading || (!text.trim() && images.length === 0)
                ? "bg-blue-400 cursor-not-allowed opacity-70"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {isLoading ? "Memposting..." : "Post"}
          </button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-2 ml-1">
          <p className="text-[10px] text-gray-400 mb-1.5 font-medium">
            Terpilih: {images.length}/10 foto
          </p>

          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 custom-scrollbar snap-x">
            {images.map((file, index) => (
              <div
                key={index}
                className="relative shrink-0 snap-start animate-fade-in group"
              >
                <div className="relative rounded-lg overflow-hidden border border-gray-300/50 bg-gray-50 flex items-center justify-center p-1 shadow-sm h-28 w-28 transition-transform group-hover:scale-[1.02]">
                  <Image
                    src={URL.createObjectURL(file)}
                    styles={{
                      root: {
                        display: "flex",
                        maxHeight: "192px",
                        maxWidth: "300px",
                      },
                    }}
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                    }}
                    className="rounded-md cursor-pointer"
                    alt={`preview-${index}`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center shadow-md hover:bg-red-600 z-20 transition-transform hover:scale-110"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};

export default CreatePostBox;
