import Constants from "../../utils/Constants"
import Item from "./Item"
import { RxDashboard } from "react-icons/rx";

const Drawer = () => {
    return (
        <aside
            className="
            fixed 
            left-0 
            bottom-0
            bg-background
            border-r-2
            border-gray-200
            shadow-lg
            py-5
            px-3
            flex
            flex-col
            gap-1
            "
            style={{
                top: Constants.headerHeight,
                width: Constants.asideWidth
            }}
        >
            <Item title="Dashboard" icon={RxDashboard} isActive={true} />

            <Item title="Dashboard" icon={RxDashboard} />
        </aside>
    )
}

export default Drawer