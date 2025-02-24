'use client'

import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
const COST_PER_VOTE = 8
const respondentOptions = [20, 50, 100, 200, 500, 1000]

interface RespondentCountProps {
    userBalance: number
    onSelect: (count: number) => void
}

export function RespondentCount({
    userBalance,
    onSelect,
}: RespondentCountProps) {
    const [count, setCount] = React.useState(20)
    const [showDialog, setShowDialog] = React.useState(false)

    const totalCost = count * COST_PER_VOTE
    const insufficientFunds = totalCost > userBalance

    const handleConfirm = () => {
        if (insufficientFunds) {
            setShowDialog(true)
        } else {
            onSelect(count)
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Количество респондентов</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span>
                                Выбрано: {count}{' '}
                                {count === 1
                                    ? 'респондент'
                                    : count < 5
                                      ? 'респондента'
                                      : 'респондентов'}
                            </span>
                            <span>Стоимость: {totalCost} ₽</span>
                        </div>
                        <SliderPrimitive.Root
                            className="relative flex w-full touch-none select-none items-center"
                            value={[count]}
                            onValueChange={([value]) => setCount(value)}
                            min={20}
                            max={1000}
                            step={1}
                        >
                            <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
                                <SliderPrimitive.Range className="absolute h-full bg-primary" />
                            </SliderPrimitive.Track>
                            <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
                        </SliderPrimitive.Root>
                        <div className="flex justify-between">
                            {respondentOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setCount(option)}
                                    className="flex flex-col items-center gap-1.5"
                                >
                                    <div className="h-1 w-1 rounded-full bg-primary" />
                                    <span className="text-xs">{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleConfirm}>Продолжить</Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
