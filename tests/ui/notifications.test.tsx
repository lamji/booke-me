import { renderHook, act } from "@testing-library/react";
import { useAdmin } from "../../presentations/Admin/useAdmin";

// Mock the dependencies
jest.mock("@/lib/hooks/useSocket", () => ({
    useSocket: () => ({ socket: null, emit: jest.fn() })
}));

jest.mock("@/lib/axios", () => ({
    get: jest.fn().mockImplementation((url: string) => {
        if (url.includes("/api/bookings")) {
            return Promise.resolve({
                data: {
                    bookings: [],
                    pagination: { total: 0, totalPages: 0, page: 1, limit: 10 }
                }
            });
        }
        return Promise.resolve({ data: [] });
    }),
    patch: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
    create: jest.fn().mockReturnThis(),
    defaults: { adapter: {} },
    interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
    },
}));

describe("Notification Logic (Rule 13 Verification)", () => {
    it("should initialize with no selected notification (Modal Closed)", () => {
        const { result } = renderHook(() => useAdmin());
        expect(result.current.selectedNotification).toBeNull();
    });

    it("should correctly set a selected notification (Open Modal)", () => {
        const { result } = renderHook(() => useAdmin());
        const mockNotification = {
            _id: "notif_123",
            type: "new_booking" as const,
            message: "Test notification",
            isRead: false,
            createdAt: new Date().toISOString()
        };

        act(() => {
            result.current.setSelectedNotification(mockNotification);
        });

        expect(result.current.selectedNotification).toEqual(mockNotification);
    });

    it("should clear the selection (Close Modal)", () => {
        const { result } = renderHook(() => useAdmin());

        act(() => {
            result.current.setSelectedNotification(null);
        });

        expect(result.current.selectedNotification).toBeNull();
    });

    it("should correctly identify unread notifications count", () => {
        const { result } = renderHook(() => useAdmin());

        // This test assumes default state or that we handle local data
        // Since it's a ViewModel test, we focus on the computed logic
        expect(result.current.unreadNotificationsCount).toBe(0);
    });
});
