import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { BookingTable } from '@/presentations/Admin/sub-components/BookingTable';
import { IBooking, BookingStatus } from '@/types/booking';

// Mock Admin Context
jest.mock('@/presentations/Admin/AdminProvider', () => ({
    useAdminContext: () => ({
        filter: 'all',
        setFilter: jest.fn(),
        eventTypeFilter: 'all',
        setEventTypeFilter: jest.fn(),
        sortBy: 'createdAt',
        setSortBy: jest.fn(),
        sortOrder: 'desc',
        setSortOrder: jest.fn(),
        page: 1,
        setPage: jest.fn(),
        totalPages: 1,
        totalItems: 1,
        events: [],
    }),
    AdminProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('BookingTable Component', () => {
    const mockUpdateStatus = jest.fn();
    const mockData = [
        {
            _id: 'booking1',
            eventType: 'Wedding',
            eventDate: new Date().toISOString(),
            eventTime: '10:00 AM',
            clientName: 'Test Client',
            clientEmail: 'test@example.com',
            clientPhone: '1234567890',
            status: "pending" as BookingStatus,
            notes: '',
            addOns: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ] as IBooking[];

    test('renders export buttons and filters', () => {
        render(
            <BookingTable
                data={mockData}
                onUpdateStatus={mockUpdateStatus}
                updatingId={null}
            />
        );

        expect(screen.getByTestId('admin-btn-export-excel')).toBeInTheDocument();
        expect(screen.getByTestId('admin-btn-export-pdf')).toBeInTheDocument();
        expect(screen.getByTestId('admin-filter-status')).toBeInTheDocument();
        expect(screen.getByTestId('admin-filter-event')).toBeInTheDocument();
    });

    test('renders booking data and action button', () => {
        render(
            <BookingTable
                data={mockData}
                onUpdateStatus={mockUpdateStatus}
                updatingId={null}
            />
        );

        expect(screen.getByText('Test Client')).toBeInTheDocument();
        expect(screen.getByTestId('admin-btn-more-actions')).toBeInTheDocument();
    });
});
