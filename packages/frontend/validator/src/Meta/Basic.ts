import { MetaRecord } from ".";
import Accepted from "../Rules/Accepted";
import Alpha from "../Rules/Alpha";
import AlphaNumeric from "../Rules/AlphaNumeric";
import AlphaNumericSymbol from "../Rules/AlphaNumericSymbol";
import AlphaSymbol from "../Rules/AlphaSymbol";
import Array from "../Rules/Array";
import Ascii from "../Rules/Ascii";
import Boolean from "../Rules/Boolean";
import ContainsLowerCase from "../Rules/ContainsLowerCase";
import ContainsNumeric from "../Rules/ContainsNumeric";
import ContainsUpperCase from "../Rules/ContainsUpperCase";
import Date from "../Rules/Date";
import Declined from "../Rules/Declined";
import Email from "../Rules/Email";
import LowerCase from "../Rules/LowerCase";
import Numeric from "../Rules/Numeric";
import Required from "../Rules/Required";
import String from "../Rules/String";
import Symbols from "../Rules/Symbols";
import UpperCase from "../Rules/UpperCase";

const Basic = {
    accepted: { validate: Accepted, params: 0 },
    alpha: { validate: Alpha, params: 0 },
    alpha_numeric: { validate: AlphaNumeric, params: 0 },
    alpha_symbols: { validate: AlphaSymbol, params: 0 },
    alpha_numeric_symbols: { validate: AlphaNumericSymbol, params: 0 },
    array: { validate: Array, params: 0 },
    ascii: { validate: Ascii, params: 0 },
    boolean: { validate: Boolean, params: 0 },
    declined: { validate: Declined, params: 0 },
    required: { validate: Required, params: 0 },
    date: { validate: Date, params: 0 },
    email: { validate: Email, params: 0 },
    upper_case: { validate: UpperCase, params: 0 },
    contains_upper_case: { validate: ContainsUpperCase, params: 0 },
    lower_case: { validate: LowerCase, params: 0 },
    contains_lower_case: { validate: ContainsLowerCase, params: 0 },
    numeric: { validate: Numeric, params: 0 },
    contains_numeric: { validate: ContainsNumeric, params: 0 },
    symbols: { validate: Symbols, params: 0 },
    contains_symbols: { validate: (value: unknown) => true, params: 0 },
    string: { validate: String, params: 0 },
} as const satisfies MetaRecord;

export default Basic

