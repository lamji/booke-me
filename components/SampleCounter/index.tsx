"use client";

import { useSampleCounter } from "./useSampleCounter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, RotateCcw, Zap } from "lucide-react";

/**
 * SampleCounter Component (View)
 *
 * Pure UI — all logic is in useSampleCounter (ViewModel).
 *
 * This is a SAMPLE component — can be removed by deleting this folder
 * and its single import line in app/page.tsx.
 */

export default function SampleCounter() {
    const {
        count,
        handleIncrement,
        handleDecrement,
        handleIncrementByAmount,
        handleReset,
    } = useSampleCounter();

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                    <span>Redux Counter</span>
                    <Badge variant="secondary" className="text-xs">
                        Sample
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-5">
                {/* Count Display */}
                <div className="flex items-center justify-center">
                    <span className="text-5xl font-bold tabular-nums tracking-tight">
                        {count}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleDecrement}
                        aria-label="Decrement"
                    >
                        <Minus className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleIncrement}
                        aria-label="Increment"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleIncrementByAmount(5)}
                        aria-label="Increment by 5"
                    >
                        <Zap className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        aria-label="Reset counter"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>

                {/* Legend */}
                <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>- / + = 1</span>
                    <span>
                        <Zap className="inline h-3 w-3" /> = +5
                    </span>
                    <span>
                        <RotateCcw className="inline h-3 w-3" /> = reset
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
