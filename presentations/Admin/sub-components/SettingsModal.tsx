"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Settings as SettingsIcon, Mail, Phone, MapPin, ShieldCheck, FileText, Save, Star } from "lucide-react";
import { useAdminContext } from "../AdminProvider";
import { updateSettingsSchema } from "@/lib/validation/settings";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SettingsFormValues = z.infer<typeof updateSettingsSchema>;

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { settings, updateSettings } = useAdminContext();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(updateSettingsSchema),
        defaultValues: {
            contactEmail: "",
            contactPhone: "",
            address: "",
            policy: "",
            termsAndConditions: "",
            cancellationPolicy: "",
        },
    });

    useEffect(() => {
        if (settings) {
            form.reset({
                contactEmail: settings.contactEmail || "",
                contactPhone: settings.contactPhone || "",
                address: settings.address || "",
                policy: settings.policy || "",
                termsAndConditions: settings.termsAndConditions || "",
                cancellationPolicy: settings.cancellationPolicy || "",
            });
        }
    }, [settings, form]);

    const onSubmit = async (data: SettingsFormValues) => {
        setIsSaving(true);
        const result = await updateSettings(data);
        setIsSaving(false);

        if (result.success) {
            toast.success("Global settings updated successfully");
            onClose();
        } else {
            toast.error("Failed to update settings");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl">
                <div className="bg-slate-900 p-8 text-white">
                    <div className="flex items-center gap-3 text-blue-400 text-[10px] font-medium uppercase tracking-[0.2em] mb-2">
                        <SettingsIcon className="h-4 w-4" />
                        System Configuration
                    </div>
                    <DialogTitle className="text-3xl font-bold tracking-tight">
                        Global Settings
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-sm mt-2">
                        Manage contact information, legal policies, and terms of service.
                    </DialogDescription>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="contactEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Mail className="h-3 w-3" />
                                            Contact Email
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-slate-50 border-slate-200 focus:ring-slate-900" placeholder="info@example.com" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Phone className="h-3 w-3" />
                                            Contact Phone
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-slate-50 border-slate-200 focus:ring-slate-900" placeholder="+1 (555) 000-0000" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="h-3 w-3" />
                                        Business Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} className="bg-slate-50 border-slate-200 focus:ring-slate-900" placeholder="123 Street Name, City, Country" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-6 pt-4 border-t border-slate-100">
                            <FormField
                                control={form.control}
                                name="policy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <ShieldCheck className="h-3 w-3" />
                                            Privacy Policy
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="min-h-[120px] bg-slate-50 border-slate-200 focus:ring-slate-900 py-3" placeholder="Enter your privacy policy content here..." />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="termsAndConditions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="h-3 w-3" />
                                            Terms & Conditions
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="min-h-[120px] bg-slate-50 border-slate-200 focus:ring-slate-900 py-3" placeholder="Enter your terms and conditions content here..." />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cancellationPolicy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Star className="h-3 w-3" />
                                            Cancellation Policy
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="min-h-[120px] bg-slate-50 border-slate-200 focus:ring-slate-900 py-3" placeholder="Enter your cancellation policy content here..." />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>

                <DialogFooter className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-900"
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        className="bg-slate-900 text-white gap-2 px-8"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
}
