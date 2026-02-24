import {
    useAppDispatch,
    useAppSelector,
    increment,
    decrement,
    incrementByAmount,
    reset,
    selectCount,
} from "@/lib/utils/redux";

/**
 * SampleCounter ViewModel
 *
 * All Redux dispatch logic lives here.
 * The View only consumes returned values and handlers.
 */
export function useSampleCounter() {
    const count = useAppSelector(selectCount);
    const dispatch = useAppDispatch();

    const handleIncrement = () => dispatch(increment());
    const handleDecrement = () => dispatch(decrement());
    const handleIncrementByAmount = (amount: number) => dispatch(incrementByAmount(amount));
    const handleReset = () => dispatch(reset());

    return {
        count,
        handleIncrement,
        handleDecrement,
        handleIncrementByAmount,
        handleReset,
    };
}
