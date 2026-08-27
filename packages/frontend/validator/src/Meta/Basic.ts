import { MetaRecord } from ".";
import Accepted from "../Rules/Public/Accepted";
import Alpha from "../Rules/Public/Alpha";
import AlphaNumeric from "../Rules/Public/AlphaNumeric";
import AlphaNumericSymbol from "../Rules/Public/AlphaNumericSymbol";
import AlphaSymbol from "../Rules/Public/AlphaSymbol";
import Array from "../Rules/Public/Array";
import Ascii from "../Rules/Public/Ascii";
import Boolean from "../Rules/Public/Boolean";
import ContainsLowerCase from "../Rules/Public/ContainsLowerCase";
import ContainsNumeric from "../Rules/Public/ContainsNumeric";
import ContainsSymbol from "../Rules/Public/ContainsSymbol";
import ContainsUpperCase from "../Rules/Public/ContainsUpperCase";
import Date from "../Rules/Public/Date";
import Declined from "../Rules/Public/Declined";
import Email from "../Rules/Public/Email";
import LowerCase from "../Rules/Public/LowerCase";
import Numeric from "../Rules/Public/Numeric";
import PlainObject from "../Rules/Public/PlainObject";
import Required from "../Rules/Public/Required";
import String from "../Rules/Public/String";
import Symbol from "../Rules/Public/Symbol";
import UpperCase from "../Rules/Public/UpperCase";

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

