import { LuSearch } from "react-icons/lu";

const Search = () => {
    return (
        <div
            className="
            min-w-50
            w-80
            h-8
            rounded-2xl
            overflow-hidden 
            bg-background-secondary
            flex
            items-center
            px-4
            gap-3
            transition-color
            duration-100
            border-2
            border-transparent
            focus-within:border-primary
            "
        >
            <LuSearch className="text-gray-400 text-xl" />
            <input
                type="text"
                className="
                bg-transparent 
                w-full 
                h-full 
                focus:outline-none 
                text-sm/6
                "
                placeholder="Search"
            />
        </div>
    )
}

export default Search