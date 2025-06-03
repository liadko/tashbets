import React, { useState, useRef, useEffect, useCallback } from "react";
import { useIsDesktop } from "../hooks/useIsDesktop";
import LandingDesktop from "./LandingDesktop";
import LandingMobile from "./LandingMobile";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { Toaster, Toast } from "../components/Toaster";

type LandingPageProps = {
  sendMessage: (msg: any) => boolean;
  setMessageHandler: (fn: (msg: any) => void) => void;
};

export default function LandingPage({
  sendMessage,
  setMessageHandler,
}: LandingPageProps) {
  const navigate = useNavigate();
  const { name: savedName, setName, setRoomCode, setId } = useSession();

  // Controlled state for both inputs
  const [nameValue, setNameValue] = useState(savedName || "");
  const [codeValue, setCodeValue] = useState("");

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((msg: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message: msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id)), 3000;
    }, 3000);
  }, []);

  // Create room handler
  const handleCreate = useCallback(() => {
    if (!nameValue.trim()) {
      showToast("Please enter your name");
      return;
    }
    setName(nameValue.trim());
    const success = sendMessage({ type: "create_room", name: nameValue.trim() });
    if (!success) showToast("Server Unavailable");
  }, [nameValue, sendMessage, setName, showToast]);

  // Join room handler
  const handleJoin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!nameValue.trim()) {
        showToast("Please enter your name");
        return;
      }
      if (!codeValue.trim()) {
        showToast("Please enter room code");
        return;
      }
      setName(nameValue.trim());
      const upperCode = codeValue.trim().toUpperCase();
      setRoomCode(upperCode);
      const success = sendMessage({
        type: "join_room",
        name: nameValue.trim(),
        code: upperCode,
      });
      if (!success) showToast("Server Unavailable");
    },
    [nameValue, codeValue, sendMessage, setName, setRoomCode, showToast]
  );

  // Socket message handler
  useEffect(() => {
    setMessageHandler((msg) => {
      switch (msg.type) {
        case "room_created":
          setRoomCode(msg.room_code);
          setId(msg.id);
          navigate("/game");
          break;
        case "room_joined":
          setRoomCode(msg.room_code);
          setId(msg.id);
          navigate("/game");
          break;
        case "room_invalid":
          showToast("Room not found");
          break;
        case "room_active":
          showToast("Room’s game already started");
          break;
        default:
          console.log("Unrecognized message:", msg);
      }
    });
  }, [setMessageHandler, navigate, setId, setRoomCode, showToast]);

  // Which view to render?
  const isDesktop = useIsDesktop();

  // Pass all props down to the view component
  const commonProps = {
    nameValue,
    setNameValue,
    codeValue,
    setCodeValue,
    handleCreate,
    handleJoin,
    toasts,
    showToast,
  };

  return (
    <>
      {isDesktop ? (
          <LandingDesktop {...commonProps} />
        ) : (
          <LandingMobile {...commonProps} />
      )}
      
    </>
  );
}
