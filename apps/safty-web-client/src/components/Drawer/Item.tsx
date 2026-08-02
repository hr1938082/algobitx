import { createElement, type FC } from "react";
import type { IconType } from 'react-icons';

interface ItemProps {
    title: string;
    icon: IconType;
    isActive?: boolean;
}

const Item: FC<ItemProps> = ({ title, icon, isActive }) => {
    return (
        <div className={`
            flex 
            items-center 
            gap-1.5 
            cursor-pointer 
            px-3 
            py-2
            rounded-xl
            ${isActive && "text-primary bg-background-secondary"}
            transition-colors
            duration-200
            hover:bg-gray-300
            hover:text-primary
            `}
        >
            {createElement(icon, { className: "text-lg" })}
            <p className="text-base font-medium">{title}</p>
        </div>
    )
}

export default Item