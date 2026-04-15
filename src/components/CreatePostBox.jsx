import React from "react";
import { Image } from "antd";
import useCreatePost from "../hooks/useCreatePost";

const CreatePostBox = ({ api, refreshFeed }) => {
  const {
    text,
    setText,
    images,
    removeImage,
    isLoading,
    handleImageChange,
    submitPost,
    textAreaRef, // ✅ Gunakan ref dari hook
  } = useCreatePost(api, refreshFeed);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitPost();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-100 flex flex-col gap-3 mx-2 sm:mx-0 overflow-hidden"
    >
      {/* --- INPUT AREA --- */}
      <div className="flex gap-2 items-center w-full min-w-0">
        <div className="grow shrink min-w-0 basis-0">
          <textarea
            ref={textAreaRef} // ✅ Menyambungkan kabel ref
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

        {/* --- ACTIONS --- */}
        <div className="shrink-0 flex items-center gap-1 sm:gap-2">
          {/* Ikon Kamera */}
          <label className="cursor-pointer p-2 hover:bg-blue-50 rounded-full transition-colors shrink-0 group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors"
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

          {/* Tombol Post */}
          <button
            type="submit"
            disabled={isLoading || (!text.trim() && images.length === 0)}
            className={`shrink-0 text-white px-5 sm:px-7 py-2 rounded-full font-bold transition-all shadow-sm text-xs sm:text-sm whitespace-nowrap ${
              isLoading || (!text.trim() && images.length === 0)
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200"
            }`}
          >
            {isLoading ? "Memposting..." : "Post"}
          </button>
        </div>
      </div>

      {/* --- IMAGE PREVIEW AREA --- */}
      {images.length > 0 && (
        <div className="mt-2 border-t border-gray-50 pt-3">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Preview Foto ({images.length}/10)
            </span>
            <button
              type="button"
              onClick={() => images.forEach((_, i) => removeImage(0))} // Opsional: Clear All
              className="text-[10px] text-red-400 hover:underline"
            >
              Hapus Semua
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 px-1 custom-scrollbar snap-x">
            <Image.PreviewGroup>
              {images.map((file, index) => (
                <div
                  key={index}
                  className="relative shrink-0 snap-start animate-fade-in group"
                >
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm h-24 w-24 sm:h-28 sm:w-28">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`preview-${index}`}
                      className="object-cover"
                      style={{ height: "100%", width: "100%" }}
                    />
                  </div>

                  {/* Tombol Hapus Satuan */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-white text-red-500 border border-red-100 rounded-full w-6 h-6 text-xs font-bold flex items-center justify-center shadow-md hover:bg-red-50 z-20 transition-all hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </Image.PreviewGroup>
          </div>
        </div>
      )}
    </form>
  );
};

export default CreatePostBox;
