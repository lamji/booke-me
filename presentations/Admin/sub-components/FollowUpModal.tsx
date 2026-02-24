"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Send,
    Loader2,
    Eye,
    EyeOff,
    Plus,
    Type,
    Image as ImageIcon,
    Minus,
    ExternalLink,
    ArrowUp,
    ArrowDown,
    Heading1,
    SeparatorHorizontal
} from "lucide-react";
import type { IClientDocument } from "@/lib/models/Client";

interface FollowUpModalProps {
    client: IClientDocument | null;
    isOpen: boolean;
    onClose: () => void;
    onSend: (email: string, subject: string, body: string, footer: string) => Promise<{ success: boolean; error?: unknown }>;
}

type BlockType = "header" | "text" | "image" | "button" | "divider";

interface EmailBlock {
    id: string;
    type: BlockType;
    content: string;
    metadata?: {
        url?: string;
        alt?: string;
        buttonText?: string;
    };
}

const DEFAULT_FOOTER = "Best regards,\nBOOK.ME Team";

export function FollowUpModal({ client, isOpen, onClose, onSend }: FollowUpModalProps) {
    const [subject, setSubject] = useState("");
    const [blocks, setBlocks] = useState<EmailBlock[]>([]);
    const [footer, setFooter] = useState(DEFAULT_FOOTER);
    const [isSending, setIsSending] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Initial load when client is selected
    useEffect(() => {
        if (client) {
            const timer = setTimeout(() => {
                setSubject(`Personal Message for ${client.name}`);
                setBlocks([
                    {
                        id: Math.random().toString(),
                        type: "header",
                        content: `Hi ${client.name}, let's make your event happen!`,
                    },
                    {
                        id: Math.random().toString(),
                        type: "text",
                        content: "I noticed you were looking for event planning services. We'd love to help you create something special.",
                    },
                    {
                        id: Math.random().toString(),
                        type: "button",
                        content: "https://book-me.com/bookings",
                        metadata: { buttonText: "Book a Consultation" }
                    }
                ]);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [client]);

    const addBlock = (type: BlockType) => {
        const newBlock: EmailBlock = {
            id: Math.random().toString(),
            type,
            content: type === "divider" ? "" : type === "button" ? "https://" : "",
            metadata: type === "button" ? { buttonText: "Click Here" } : type === "image" ? { alt: "Image Description" } : {}
        };
        setBlocks([...blocks, newBlock]);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlock = (id: string, content: string, metadata?: EmailBlock['metadata']) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content, metadata: metadata || b.metadata } : b));
    };

    const moveBlock = (index: number, direction: "up" | "down") => {
        const newBlocks = [...blocks];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newBlocks.length) {
            [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
            setBlocks(newBlocks);
        }
    };

    const generateHTML = () => {
        if (!client) return "";
        let html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6;">`;

        blocks.forEach(block => {
            const content = block.content.replace("{{name}}", client.name);
            switch (block.type) {
                case "header":
                    html += `<h2 style="color: #1e293b; font-size: 24px; margin-bottom: 20px;">${content}</h2>`;
                    break;
                case "text":
                    html += `<p style="margin-bottom: 16px; font-size: 16px;">${content}</p>`;
                    break;
                case "image":
                    html += `<div style="margin: 24px 0;"><img src="${block.content}" alt="${block.metadata?.alt || ''}" style="width: 100%; border-radius: 8px; display: block;" /></div>`;
                    break;
                case "button":
                    html += `<div style="text-align: center; margin: 32px 0;"><a href="${block.content}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">${block.metadata?.buttonText || "Check it out"}</a></div>`;
                    break;
                case "divider":
                    html += `<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />`;
                    break;
            }
        });

        html += `<div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 14px; color: #64748b; font-style: italic;">${footer.replace(/\n/g, '<br/>')}</div>`;
        html += `</div>`;
        return html;
    };

    const handleSend = async () => {
        if (!client) return;
        setIsSending(true);
        const html = generateHTML();
        // Since the onSend prop asks for (email, subject, body, footer), we'll pass the generated HTML as the 'body'
        // and handle it on the backend or adjust calling.
        const result = await onSend(client.email, subject, html, footer);
        setIsSending(false);
        if (result.success) {
            onClose();
        }
    };

    if (!client) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="mb-0 flex h-screen min-w-full flex-col md:flex-row justify-between gap-0 p-0 border-none shadow-none overflow-hidden bg-white rounded-none">
                {/* Left Side: Block Editor (50%) */}
                <div className="flex-[1] flex flex-col min-h-0 border-r border-slate-200 bg-slate-50/50">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Email Builder</DialogTitle>
                        <DialogDescription>Drafting for: {client.name}</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-10 py-8">
                        <div className="max-w-xl mx-auto space-y-8 pb-20">
                            {/* Subject & Controls */}
                            <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Subject</Label>
                                    <Input
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Enter subject..."
                                        className="h-12 border-slate-200 focus:ring-0 focus:border-blue-500 transition-all font-semibold text-slate-900 bg-slate-50/50"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                                    <Button size="sm" variant="outline" className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest" onClick={() => addBlock("header")}><Heading1 className="h-3 w-3" /> Header</Button>
                                    <Button size="sm" variant="outline" className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest" onClick={() => addBlock("text")}><Type className="h-3 w-3" /> Text</Button>
                                    <Button size="sm" variant="outline" className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest" onClick={() => addBlock("image")}><ImageIcon className="h-3 w-3" /> Image</Button>
                                    <Button size="sm" variant="outline" className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest" onClick={() => addBlock("button")}><ExternalLink className="h-3 w-3" /> Button</Button>
                                    <Button size="sm" variant="outline" className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest" onClick={() => addBlock("divider")}><SeparatorHorizontal className="h-3 w-3" /> Divider</Button>
                                </div>
                            </div>

                            {/* Dynamic Blocks */}
                            <div className="space-y-4">
                                {blocks.map((block, index) => (
                                    <div key={block.id} className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-blue-300 transition-all">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border-blue-100 px-2 py-0.5">{block.type}</Badge>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveBlock(index, "up")} disabled={index === 0}><ArrowUp className="h-3 w-3" /></Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveBlock(index, "down")} disabled={index === blocks.length - 1}><ArrowDown className="h-3 w-3" /></Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeBlock(block.id)}><Minus className="h-3 w-3" /></Button>
                                            </div>
                                        </div>

                                        {block.type === "header" && (
                                            <Input
                                                value={block.content}
                                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                                className="font-bold border-none p-0 focus-visible:ring-0 text-lg placeholder:text-slate-300 h-auto"
                                                placeholder="Write a catchy header..."
                                            />
                                        )}

                                        {block.type === "text" && (
                                            <Textarea
                                                value={block.content}
                                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                                className="min-h-[100px] border-none p-0 focus-visible:ring-0 shadow-none resize-none text-slate-700 leading-relaxed placeholder:text-slate-300"
                                                placeholder="Enter your message... use {{name}} for dynamic name."
                                            />
                                        )}

                                        {block.type === "image" && (
                                            <div className="space-y-3">
                                                <Input
                                                    value={block.content}
                                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                                    placeholder="Paste image URL (Source)..."
                                                    className="bg-slate-50 border-slate-200 h-10 text-xs"
                                                />
                                                <Input
                                                    value={block.metadata?.alt}
                                                    onChange={(e) => updateBlock(block.id, block.content, { alt: e.target.value })}
                                                    placeholder="Alternative Text (SEO)..."
                                                    className="bg-slate-50 border-slate-200 h-10 text-xs"
                                                />
                                            </div>
                                        )}

                                        {block.type === "button" && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <Input
                                                    value={block.metadata?.buttonText}
                                                    onChange={(e) => updateBlock(block.id, block.content, { buttonText: e.target.value })}
                                                    placeholder="Button Label..."
                                                    className="bg-slate-50 border-slate-200 h-10 text-xs"
                                                />
                                                <Input
                                                    value={block.content}
                                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                                    placeholder="Link URL..."
                                                    className="bg-slate-50 border-slate-200 h-10 text-xs"
                                                />
                                            </div>
                                        )}

                                        {block.type === "divider" && (
                                            <div className="h-auto py-2 flex items-center justify-center">
                                                <Separator className="bg-slate-100" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="space-y-2 bg-white/50 p-6 rounded-2xl border border-dashed border-slate-300">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Footer / Signature</Label>
                                <Textarea
                                    value={footer}
                                    onChange={(e) => setFooter(e.target.value)}
                                    className="h-20 border-none p-0 focus-visible:ring-0 shadow-none resize-none text-[11px] text-slate-400 bg-transparent placeholder:text-slate-200"
                                    placeholder="Add your signature..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-10 py-6 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => setShowPreview(!showPreview)}
                            className="md:hidden text-slate-600"
                        >
                            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                            Preview
                        </Button>
                        <div className="hidden md:flex items-center gap-2 text-slate-400">
                            <Plus className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Auto-saving Draft</span>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={onClose} className="h-11 px-8 font-bold text-[10px] uppercase tracking-widest">Cancel</Button>
                            <Button
                                onClick={handleSend}
                                disabled={isSending || blocks.length === 0}
                                className="h-11 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-500/20"
                            >
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Send Email
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Live HTML Preview (50%) */}
                <div className={`flex-[1] bg-slate-200/50 p-12 transition-all min-h-0 ${showPreview ? 'fixed inset-0 z-50 bg-white md:relative md:bg-transparent' : 'hidden md:flex md:flex-col'}`}>
                    <div className="max-w-2xl mx-auto w-full flex flex-col h-full min-h-0">
                        <div className="flex items-center justify-between mb-8 shrink-0">
                            <div className="flex items-center gap-3">
                                <Badge className="bg-green-500 text-white border-none px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-green-500/20">Live Rendering</Badge>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Optimized</span>
                            </div>
                            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setShowPreview(false)}><EyeOff className="h-5 w-5" /></Button>
                        </div>

                        {/* Browser-like Preview Window */}
                        <div className="flex-1 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col min-h-0">
                            {/* Browser Top Bar */}
                            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 space-y-3 shrink-0">
                                <div className="flex gap-1.5 mb-2">
                                    <div className="h-2 w-2 rounded-full bg-red-400" />
                                    <div className="h-2 w-2 rounded-full bg-yellow-400" />
                                    <div className="h-2 w-2 rounded-full bg-green-400" />
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="text-slate-400 font-medium whitespace-nowrap">To:</span>
                                    <span className="text-slate-900 font-bold bg-slate-200/50 px-2 py-0.5 rounded-md">{client.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="text-slate-400 font-medium whitespace-nowrap">Subject:</span>
                                    <span className="text-slate-900 font-bold italic truncate">{subject || "No subject specified"}</span>
                                </div>
                            </div>

                            {/* Scrollable Email Content */}
                            <div className="flex-1 overflow-y-auto bg-white">
                                <div className="p-10">
                                    {blocks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                                                <Plus className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Add a block to start</p>
                                                <p className="text-xs text-slate-300">Your professional email will appear here</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="prose prose-slate max-w-none"
                                            dangerouslySetInnerHTML={{ __html: generateHTML() }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Preview Footer */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Encrypted Handshake Active</span>
                            </div>
                        </div>

                        <div className="mt-8 flex items-start gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 shrink-0">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                <ImageIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-blue-900 uppercase tracking-[0.1em]">Pro Tip: Personalization</p>
                                <p className="text-xs text-blue-700/70 leading-relaxed font-medium">
                                    Emails with images and direct calls-to-action (buttons) have 45% higher engagement. Use {"{{name}}"} to greet the client personally.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper Components
function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "outline", className?: string }) {
    const variants = {
        default: "bg-slate-900 text-white",
        outline: "border border-slate-200 text-slate-600"
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium leading-none ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}

function Separator({ className = "" }: { className?: string }) {
    return <div className={`h-[1px] w-full bg-slate-200 ${className}`} />;
}
