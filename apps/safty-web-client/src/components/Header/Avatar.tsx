import { HiOutlineUser } from "react-icons/hi2";
import { LuChevronDown } from "react-icons/lu";

const Avatar = () => {
    return (
        <div className="flex items-center transition duration-200 hover:text-primary">
            <div className="h-5 w-0.5 mr-5 bg-background-secondary" />
            <div className="flex items-center cursor-pointer">
                <div className="
                    w-8 
                    h-8 
                    rounded-full 
                    bg-background-secondary
                    flex
                    items-center
                    justify-center
                    mr-1
                    "
                >
                    <HiOutlineUser className="text-xl" />
                </div>
                <p className="text-sm font-medium">Hassan Raza</p>
                <LuChevronDown />
            </div>
        </div>
    )
}

export default Avatar