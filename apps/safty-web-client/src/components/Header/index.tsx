import Constants from "../../utils/Constants"
import Logo from "./Logo"
import Nav from "./Nav"

const Header = () => {
    return (
        <header
            className="bg-background flex items-center shadow-lg"
            style={{ height: Constants.headerHeight }}
        >
            <Logo />
            <Nav />
        </header>
    )
}

export default Header