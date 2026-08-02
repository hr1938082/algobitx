import Avatar from "./Avatar";
import Search from "./Search"
import { IoNotificationsOutline } from "react-icons/io5";

const Nav = () => {
    return (
        <nav className="flex w-full items-center justify-between pl-10 pr-6">
            <Search />
            <div className="flex gap-2 items-center">
                <IoNotificationsOutline
                    className="
                    text-2xl 
                    cursor-pointer 
                    transition 
                    duration-200 
                    hover:text-primary
                    "
                />
                <Avatar />
            </div>
        </nav>
    )
}

export default Nav