/**
 * Jest Unit Tests — useAdminChat ViewModel (The Tiger)
 *
 * Tests that the Admin ViewModel correctly manages:
 * - Tiger greeting message
 * - Admin API communication
 * - Loading state
 * - Authorization error handling
 */

import { renderHook, act } from "@testing-library/react";
import { useAdminChat } from "@/presentations/AdminChatBot/useAdminChat";

// Mock axios
jest.mock("@/lib/axios", () => ({
    post: jest.fn(),
}));

import api from "@/lib/axios";

describe("useAdminChat ViewModel (The Tiger)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("initializes with The Tiger greeting", () => {
        const { result } = renderHook(() => useAdminChat());
        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].role).toBe("assistant");
        expect(result.current.messages[0].content).toContain("The Tiger");
    });

    test("toggleChat toggles isOpen", () => {
        const { result } = renderHook(() => useAdminChat());
        expect(result.current.isOpen).toBe(false);

        act(() => {
            result.current.toggleChat();
        });
        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.toggleChat();
        });
        expect(result.current.isOpen).toBe(false);
    });

    test("send appends user message and calls admin API", async () => {
        (api.post as jest.Mock).mockResolvedValueOnce({
            data: { reply: "Directives received. Operational status green." },
        });

        const { result } = renderHook(() => useAdminChat());

        act(() => {
            result.current.setInput("Check incoming events");
        });

        await act(async () => {
            await result.current.send();
        });

        expect(result.current.messages).toHaveLength(3);
        expect(result.current.messages[1].content).toBe("Check incoming events");
        expect(result.current.messages[2].content).toBe("Directives received. Operational status green.");
        expect(api.post).toHaveBeenCalledWith("/api/admin/chat", expect.anything());
    });

    test("shows specific error for unauthorized access (401)", async () => {
        const error = {
            response: { status: 401 }
        };
        (api.post as jest.Mock).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useAdminChat());

        act(() => {
            result.current.setInput("Search client John");
        });

        await act(async () => {
            await result.current.send();
        });

        const lastMsg = result.current.messages[result.current.messages.length - 1];
        expect(lastMsg.content).toContain("Access Denied");
    });

    test("shows general error for other API failures", async () => {
        const error = {
            response: { status: 500 }
        };
        (api.post as jest.Mock).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useAdminChat());

        act(() => {
            result.current.setInput("admin report");
        });

        await act(async () => {
            await result.current.send();
        });

        const lastMsg = result.current.messages[result.current.messages.length - 1];
        expect(lastMsg.content).toContain("Operational error");
    });
});
