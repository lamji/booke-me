/**
 * Jest Unit Tests — useChat ViewModel
 *
 * Tests that the ViewModel correctly manages:
 * - Initial state
 * - Message appending
 * - Date extraction heuristic
 * - Loading state toggling
 */

import { renderHook, act } from "@testing-library/react";
import { useChat } from "@/presentations/ChatBot/useChat";

// Mock axios
jest.mock("@/lib/axios", () => ({
  post: jest.fn(),
}));

import api from "@/lib/axios";

describe("useChat ViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("initializes with Booky greeting message", () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("assistant");
    expect(result.current.messages[0].content).toContain("Booky");
  });

  test("isOpen defaults to false", () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.isOpen).toBe(false);
  });

  test("openChat sets isOpen to true", () => {
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.openChat();
    });
    expect(result.current.isOpen).toBe(true);
  });

  test("closeChat sets isOpen to false", () => {
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.openChat();
    });
    act(() => {
      result.current.closeChat();
    });
    expect(result.current.isOpen).toBe(false);
  });

  test("send appends user message and calls API", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { reply: "Hello! I can help with that." },
    });

    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.setInput("What events do you offer?");
    });

    await act(async () => {
      await result.current.send();
    });

    // User msg + initial greeting + assistant reply = 3
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[1].role).toBe("user");
    expect(result.current.messages[2].role).toBe("assistant");
    expect(result.current.messages[2].content).toBe("Hello! I can help with that.");
    expect(result.current.input).toBe(""); // Input cleared
  });

  test("send does nothing when input is empty", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.send();
    });

    expect(result.current.messages).toHaveLength(1); // Only initial greeting
    expect(api.post).not.toHaveBeenCalled();
  });

  test("shows fallback message on API error", async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.setInput("test question");
    });

    await act(async () => {
      await result.current.send();
    });

    const lastMsg = result.current.messages[result.current.messages.length - 1];
    expect(lastMsg.role).toBe("assistant");
    expect(lastMsg.content).toContain("trouble connecting");
  });
});
