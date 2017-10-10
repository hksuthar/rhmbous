// Note used, but can work with functions not in the window context.
function executeFunctionByName(functionName, context /*, args */) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}


// Handle the battery maximum charge current element.
function Bat_Max_Chg_Cur(op, data, rowDef) {
    switch (op) {
        case "format":
            return "Bat";

        default:
    };
}


// Handle the battery maximum charge power element.
function Bat_Max_Chg_Pwr(op, data, rowDef) {
    switch (op) {
        case "format":
            return "fart";

        default:
    };
}


// Handle the battery maximum discharge current element.
function Bat_Max_Dchg_Cur(op, data, rowDef) {
    switch (op) {
        case "format":
            return "fart";

        default:
    };
}


// Handle the battery maximum discharge power element.
function Bat_Max_Dchg_Pwr(op, data, rowDef) {
    switch (op) {
        case "format":
            return "fart";

        default:
    };
}


// Handle the CIU Date element.
function CIU_Date(op, data, rowDef) {
    switch (op) {
        case "format":
            return "2016/01/01";

        default:
    };
}


// Handle the CIU Time element.
function CIU_Time(op, data, rowDef) {
    switch (op) {
        case "format":
            return "12:59:59";

        default:
    };
}


// Handle the DC Links Set element.
function DC_Lnk_Set(op, data, rowDef) {
    switch (op) {
        case "format":
            return "DC";

        default:
    };
}

// Handle the formatting and selection of list elements.
function L(op, data, rowDef){
    var args = rowDef.rangeArgs;
    var sep1 = args[0].substring(1, args[0].length - 1);    // separator between name:value pairs
    var sep2 = args[1].substring(1, args[1].length - 1);    // separator within name:value pairs
    var list = args[2].substring(1, args[2].length - 1);    // array of name:value pairs
    list = list.split(sep1);

    var i;
    switch (op) {
        case "format":
            // Search the name:value pairs for a match with data.
            data = data % list.length;
            for (i = 0; i < list.length; i++) {
                var nameValue = list[i].split(sep2);
                if (nameValue[1] == data)
                    return nameValue[0];
            }
            return "Unknown";

        case "select":
            break;

        default:
    };
}


// Handle the Operation Mode Setpoints element.
function Op_Mod_Set(op, data, rowDef) {
    switch (op) {
        case "format":
            return "OMS";

        default:
    };
}


// Handle the Power Factor element.
function Pwr_Factor(op, data, rowDef) {
    switch (op) {
        case "format":
            return "PF";

        default:
    };
}


function R(op, data, rowDef) {
    var args = rowDef.rangeArgs;
    var low = parseFloat(args[0]);     // low value
    if (isNaN(low))
        low = 0.0;
    var high = parseFloat(args[1]);    // high value
    if (isNaN(high))
        high = 0.0;
    var incr = parseFloat(args[2]);    // increment
    if (isNaN(incr))
        incr = 0.0;
    var format = args[3].substring(1, args[3].length - 1);  // format string

    switch (op) {
        case "format":
            value = sprintf(format, data);
            return value;

        case "select":
            break;

        default:
    };
}

function B(op, data, rowDef){
    var args = rowDef.rangeArgs;
    var sep1 = args[0].substring(1, args[0].length - 1);    // separator between name:value pairs
    var sep2 = args[1].substring(1, args[1].length - 1);    // separator within name:value pairs
    var list = args[2].substring(1, args[2].length - 1);    // array of name:value pairs
    list = list.split(sep1);

    var i, a = "";
    switch (op) {
        case "format":
            // Search the name:value pairs for a match with data.
            if(data == ''){
                return "Unknown";
            }
            else{
                a = (data >>> 0).toString(2);
                //data = data % list.length;
                //console.log(a);
                var j = 1, pos = 0;
                while (!(j & a))
                {
                    j = j << 1;
                    ++pos;
                }
                for (i = 0; i < list.length; i++) {
                    var nameValue = list[i].split(sep2);
                    if (nameValue[1] == pos)
                        return nameValue[0];
                }
                return "Unknown";
        }

        case "select":
            break;

        default:
    };
}