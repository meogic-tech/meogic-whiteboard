type Func = () => void;
export function mergeRegister(...func: Array<Func>): () => void {
    return () => {
        func.forEach((f) => f());
    };
}
