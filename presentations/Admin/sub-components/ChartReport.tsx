"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { format, subDays } from "date-fns";

const chartConfig = {
    bookings: {
        label: "Bookings",
        color: "black",
    },
} satisfies ChartConfig;

interface ChartData {
    createdAt?: string | Date;
    date?: string | Date;
    [key: string]: unknown;
}

interface ChartReportProps {
    data: ChartData[];
    title: string;
}

export function ChartReport({ data, title }: ChartReportProps) {
    // Group bookings/traffic by date for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        const dateStr = format(date, "yyyy-MM-dd");
        const count = data.filter((b) => {
            const bDate = new Date(b.createdAt || b.date || new Date());
            return format(bDate, "yyyy-MM-dd") === dateStr;
        }).length;

        return {
            date: format(date, "MMM dd"),
            bookings: count,
        };
    }).reverse();

    return (
        <div className="rounded-2xl border-2 border-stone-100 bg-white text-black p-6">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] mb-6 text-stone-500">{title}</h3>
            <ChartContainer config={chartConfig} className="min-h-[140px] w-full">
                <BarChart data={last7Days} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f1f1" strokeOpacity={1} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tick={{ fill: "black", fontSize: 9, fontWeight: "900" }}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "black", fontSize: 9, fontWeight: "900" }}
                    />
                    <ChartTooltip
                        content={<ChartTooltipContent className="bg-white border-2 border-black text-black shadow-xl font-black p-2 text-[10px]" />}
                    />
                    <Bar
                        dataKey="bookings"
                        fill="black"
                        radius={[0, 0, 0, 0]}
                        barSize={20}
                    />
                </BarChart>
            </ChartContainer>
        </div>
    );
}
