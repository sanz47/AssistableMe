
import React, { useEffect, useState, useMemo } from 'react';

const CONFETTI_COUNT = 60;

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const ConfettiPiece: React.FC = () => {
    const style = useMemo<React.CSSProperties>(() => ({
        position: 'absolute',
        width: `${random(6, 12)}px`,
        height: `${random(3, 6)}px`,
        backgroundColor: `hsl(${random(0, 360)}, 100%, 50%)`,
        top: `${random(-10, -5)}%`,
        left: `${random(0, 100)}%`,
        opacity: 1,
        transform: `rotate(${random(-200, 200)}deg)`,
        animation: `fall ${random(2, 4)}s ${random(0, 2)}s linear forwards`,
    }), []);

    return <i style={style} />;
};

export const Confetti: React.FC = () => {
    const [pieces, setPieces] = useState<number[]>([]);

    useEffect(() => {
        const keyframes = `
            @keyframes fall {
                to {
                    transform: translateY(110vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.innerText = keyframes;
        document.head.appendChild(styleSheet);
        
        setPieces(Array.from({ length: CONFETTI_COUNT }).map((_, i) => i));

        return () => {
            if (document.head.contains(styleSheet)) {
                document.head.removeChild(styleSheet);
            }
        };
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
            {pieces.map(p => <ConfettiPiece key={p} />)}
        </div>
    );
};
