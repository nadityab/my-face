// components/MentionTextarea.jsx
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { API_URL } from "../api";

const MentionTextarea = ({
    value,
    onChange,
    placeholder,
    users = [],
    className = "",
    rows = 3,
    autoFocus = false
}) => {
    const [showMention, setShowMention] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 });
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef(null);
    const mentionRef = useRef(null);

    const currentUserId = localStorage.getItem("userId");

    // Filter users
    const filteredUsers = users.filter(user =>
        user?.username?.toLowerCase().includes(mentionQuery?.toLowerCase() || '') &&
        user._id !== currentUserId // skip diri sendiri
    );

    // Handle text change dengan deteksi @
    const handleChange = (e) => {
        const newText = e.target.value;
        const cursorPos = e.target.selectionStart;

        onChange(e);

        const textBeforeCursor = newText.slice(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const query = textBeforeCursor.slice(lastAtIndex + 1);
            const hasSpace = query.includes(' ');

            if (!hasSpace) {
                setMentionQuery(query);
                setShowMention(true);
                setCursorPosition(cursorPos);

                const rect = e.target.getBoundingClientRect();

                // ✅ Pakai client coordinate (tanpa scroll) karena fixed relative to viewport
                setMentionPosition({
                    x: rect.left,
                    y: rect.bottom + 5
                });
            } else {
                setShowMention(false);
            }
        } else {
            setShowMention(false);
        }
    };

    // Tambah useEffect untuk update posisi saat scroll
    useEffect(() => {
        if (!showMention || !textareaRef.current) return;

        const updatePosition = () => {
            const rect = textareaRef.current.getBoundingClientRect();
            setMentionPosition({
                x: rect.left,
                y: rect.bottom + 5
            });
        };

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [showMention]);

    // Pilih user untuk mention
    const selectMention = (user) => {
        const textBeforeCursor = value.slice(0, cursorPosition);
        const textAfterCursor = value.slice(cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        const mentionText = `@${user.username} `;
        const newText =
            value.slice(0, lastAtIndex) +
            mentionText +
            textAfterCursor;

        // Buat event object untuk onChange
        const fakeEvent = {
            target: { value: newText }
        };
        onChange(fakeEvent);

        setShowMention(false);
        setMentionQuery("");

        // Set cursor ke posisi yang benar
        const newCursorPos = lastAtIndex + mentionText.length;
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 50);
    };

    // Close popup
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (mentionRef.current && !mentionRef.current.contains(e.target) &&
                textareaRef.current && !textareaRef.current.contains(e.target)) {
                setShowMention(false);
            }
        };

        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setShowMention(false);
            }
        };

        if (showMention) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [showMention]);

    return (
        <>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className={className}
                rows={rows}
                autoFocus={autoFocus}
            />

            {/* Popup mention via portal */}
            {showMention && filteredUsers.length > 0 && createPortal(
                <div
                    ref={mentionRef}
                    className="fixed z-9999 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
                    style={{
                        top: mentionPosition.y,
                        left: mentionPosition.x,
                        minWidth: '280px',
                        maxWidth: '320px',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}
                >
                    {filteredUsers.slice(0, 5).map((user) => (
                        <button
                            key={user._id}
                            type="button"
                            onClick={() => selectMention(user)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-slate-700 last:border-0"
                        >
                            <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                {user.avatar ? (
                                    <img
                                        src={`${API_URL}${user.avatar}`}
                                        alt={user.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user.username?.charAt(0)?.toUpperCase()
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {user.username}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};

export default MentionTextarea;