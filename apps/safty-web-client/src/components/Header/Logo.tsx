import Constants from "../../utils/Constants"
import { HiBars3 } from "react-icons/hi2";

const Logo = () => {
    return (
        <div
            style={{ width: Constants.asideWidth }}
            className="
            pl-5 
            pr-10 
            flex 
            justify-between 
            border-r-2
            border-gray-200
            shrink-0
            "
        >
            <HiBars3
                className="
                cursor-pointer
                transition 
                duration-200 
                hover:text-primary
                text-2xl
                "
            />
            <h1>LOGO</h1>
        </div>
    )
}

export default Logo