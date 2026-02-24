import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FollowUpModal } from '@/presentations/Admin/sub-components/FollowUpModal';
import { IClientDocument } from '@/lib/models/Client';

const mockClient: Partial<IClientDocument> = {
    _id: ('123' as unknown) as IClientDocument['_id'],
    name: 'John Doe',
    email: 'john@example.com',
};

describe('FollowUpModal', () => {
    it('renders correctly when open', () => {
        render(
            <FollowUpModal
                client={mockClient as IClientDocument}
                isOpen={true}
                onClose={() => { }}
                onSend={async () => ({ success: true })}
            />
        );

        expect(screen.getByText(/Email Builder/i)).toBeInTheDocument();
        expect(screen.getByText(/Drafting for: John Doe/i)).toBeInTheDocument();
    });

    it('updates preview when subject or body changes', () => {
        render(
            <FollowUpModal
                client={mockClient as IClientDocument}
                isOpen={true}
                onClose={() => { }}
                onSend={async () => ({ success: true })}
            />
        );

        // Uses getAllByPlaceholderText or getByDisplayValue since it's just an input now without an 'id' bound to the Label
        const subjectInput = screen.getByPlaceholderText(/Enter subject.../i);
        fireEvent.change(subjectInput, { target: { value: 'New Subject' } });

        // Preview subject check 
        expect(screen.getByText(/New Subject/i)).toBeInTheDocument();
    });
});
