import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingPresentation from '@/presentations/Booking/index';
import { useBooking } from '@/presentations/Booking/useBooking';
import { IEvent } from '@/lib/models/Event';

// Mock the useBooking hook
jest.mock('@/presentations/Booking/useBooking');

const mockUseBooking = useBooking as jest.MockedFunction<typeof useBooking>;

describe('BookingPresentation Component', () => {
    const mockSetEventType = jest.fn();
    const mockSetEventDate = jest.fn();
    const mockSetEventTime = jest.fn();
    const mockSetClientName = jest.fn();
    const mockSetClientEmail = jest.fn();
    const mockSetClientPhone = jest.fn();
    const mockSetNotes = jest.fn();
    const mockSubmitBooking = jest.fn();

    beforeEach(() => {
        mockUseBooking.mockReturnValue({
            eventType: '',
            setEventType: mockSetEventType,
            eventDate: undefined,
            setEventDate: mockSetEventDate,
            eventTime: '',
            setEventTime: mockSetEventTime,
            clientName: '',
            setClientName: mockSetClientName,
            clientEmail: '',
            setClientEmail: mockSetClientEmail,
            clientPhone: '',
            setClientPhone: mockSetClientPhone,
            notes: '',
            setNotes: mockSetNotes,
            addOns: [],
            toggleAddOn: jest.fn(),
            isSubmitting: false,
            submitResult: null,
            submitBooking: mockSubmitBooking,
            isDataLoading: false,
            events: [{ _id: '1', name: 'Wedding' } as unknown as IEvent],
            currentEvent: undefined,
            isPreSelected: false,
            missingFields: [],
            setMissingFields: jest.fn(),
            showSummary: false,
            setShowSummary: jest.fn(),
            handleSummary: jest.fn(),
            calculateTotalPrice: jest.fn(() => 0),
        });
    });

    test('renders all booking form fields', () => {
        render(<BookingPresentation />);

        expect(screen.getByTestId('select-event-type')).toBeInTheDocument();
        expect(screen.getByTestId('btn-pick-date')).toBeInTheDocument();
        expect(screen.getByTestId('select-time')).toBeInTheDocument();
        expect(screen.getByTestId('input-client-name')).toBeInTheDocument();
        expect(screen.getByTestId('input-client-email')).toBeInTheDocument();
        expect(screen.getByTestId('input-client-phone')).toBeInTheDocument();
        expect(screen.getByTestId('input-notes')).toBeInTheDocument();
        expect(screen.getByTestId('btn-submit-booking')).toBeInTheDocument();
    });

    test('calls submitBooking when submit button is clicked', async () => {
        render(<BookingPresentation />);

        const submitBtn = screen.getByTestId('btn-submit-booking');
        fireEvent.click(submitBtn);

        expect(mockSubmitBooking).toHaveBeenCalled();
    });

    test('updates form fields on user input', () => {
        render(<BookingPresentation />);

        const nameInput = screen.getByTestId('input-client-name');
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        expect(mockSetClientName).toHaveBeenCalledWith('John Doe');

        const emailInput = screen.getByTestId('input-client-email');
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        expect(mockSetClientEmail).toHaveBeenCalledWith('john@example.com');
    });
});
