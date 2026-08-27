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
import ContainsSymbol from "../Rules/ContainsSymbol";
import ContainsUpperCase from "../Rules/ContainsUpperCase";
import Date from "../Rules/Date";
import Declined from "../Rules/Declined";
import Email from "../Rules/Email";
import LowerCase from "../Rules/LowerCase";
import Numeric from "../Rules/Numeric";
import PlainObject from "../Rules/PlainObject";
import Required from "../Rules/Required";
import String from "../Rules/String";
import Symbol from "../Rules/Symbol";
import UpperCase from "../Rules/UpperCase";

const Basic = {
    accepted: { validate: Accepted, params: 0, type: 'public' },
    alpha: { validate: Alpha, params: 0, type: 'public' },
    alpha_numeric: { validate: AlphaNumeric, params: 0, type: 'public' },
    alpha_symbols: { validate: AlphaSymbol, params: 0, type: 'public' },
    alpha_numeric_symbols: { validate: AlphaNumericSymbol, params: 0, type: 'public' },
    array: { validate: Array, params: 0, type: 'public' },
    ascii: { validate: Ascii, params: 0, type: 'public' },
    boolean: { validate: Boolean, params: 0, type: 'public' },
    declined: { validate: Declined, params: 0, type: 'public' },
    required: { validate: Required, params: 0, type: 'public' },
    date: { validate: Date, params: 0, type: 'public' },
    email: { validate: Email, params: 0, type: 'public' },
    plain_object: { validate: PlainObject, params: 0, type: 'public' },
    upper_case: { validate: UpperCase, params: 0, type: 'public' },
    contains_upper_case: { validate: ContainsUpperCase, params: 0, type: 'public' },
    lower_case: { validate: LowerCase, params: 0, type: 'public' },
    contains_lower_case: { validate: ContainsLowerCase, params: 0, type: 'public' },
    numeric: { validate: Numeric, params: 0, type: 'public' },
    contains_numeric: { validate: ContainsNumeric, params: 0, type: 'public' },
    symbols: { validate: Symbol, params: 0, type: 'public' },
    contains_symbols: { validate: ContainsSymbol, params: 0, type: 'public' },
    string: { validate: String, params: 0, type: 'public' },
} as const satisfies MetaRecord;

export default Basic

