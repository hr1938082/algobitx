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
import Integer from "../Rules/Public/Integer";
import LowerCase from "../Rules/Public/LowerCase";
import NotRequired from "../Rules/Public/NotRequired";
import Numeric from "../Rules/Public/Numeric";
import PlainObject from "../Rules/Public/PlainObject";
import Required from "../Rules/Public/Required";
import String from "../Rules/Public/String";
import Symbol from "../Rules/Public/Symbol";
import UpperCase from "../Rules/Public/UpperCase";

const Basic = {
    accepted: Accepted,
    alpha: Alpha,
    alpha_numeric: AlphaNumeric,
    alpha_symbols: AlphaSymbol,
    alpha_numeric_symbols: AlphaNumericSymbol,
    array: Array,
    ascii: Ascii,
    boolean: Boolean,
    declined: Declined,
    required: Required,
    date: Date,
    email: Email,
    integer: Integer,
    plain_object: PlainObject,
    upper_case: UpperCase,
    contains_upper_case: ContainsUpperCase,
    lower_case: LowerCase,
    contains_lower_case: ContainsLowerCase,
    nullable: Required,
    numeric: Numeric,
    not_required: NotRequired,
    contains_numeric: ContainsNumeric,
    symbols: Symbol,
    contains_symbols: ContainsSymbol,
    string: String,
} as const;

export default Basic

