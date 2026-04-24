export function parseIntFromStr(value, errNum) {
    if (!value) {
        return errNum;
    }

    if (value == "") {
        return errNum;
    }

    var num = parseInt(value);
    if (!num) {
        return errNum;
    } else {
        return num;
    }
}

export function parseFloatFromStr(value, errNum) {
    if (!value) {
        return errNum;
    }

    if (value == "") {
        return errNum;
    }

    var num = parseFloat(value);
    if (!num) {
        return errNum;
    } else {
        return num;
    }
}

function isStringEmpty(str) {
    return str === undefined || str === null || str.trim() === "" ? true : false;
}

function isString(value) {
    return typeof value === "string" || value instanceof String;
}

function isInteger(value) {
    if (typeof value === "number") {
        return Number.isInteger(value);
    } else if (typeof value === "string") {
        const num = parseInt(value, 10);
        return !isNaN(num) && Number.isInteger(num);
    } else if (value !== null && typeof value === "object" && value.constructor === Number) {
        return Number.isInteger(value.valueOf());
    }

    return false;
}

function isNotNull(value) {
    return value !== null && value !== undefined;
}
