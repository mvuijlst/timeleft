function startTime() {
    var today = new Date();

    var yy = today.getFullYear();
    var mm = today.getMonth() + 1;
    var dd = today.getDate();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    var ms = today.getMilliseconds();

    var t = setTimeout(startTime, 1);

    var startOfDay = new Date(yy, mm, dd, 8, 30, 0);
    var endOfDay = new Date(yy, mm, dd, 17, 0, 0);


    $("#now").html(dd + "/" + mm + "/" + yy + " " + h + ":" + doPad(m, 2) + ":" + doPad(s, 2) + "." + doPad(ms, 3));

    makeBar('milliseconds2', 'Seconde', 0, 1000, ms, '', '', 'ms', 'square');
    makeBar('seconds', 'Minuut', 0, toMs(0, 1), toMs(0, 0, s, ms), '', '', 's.ms', 'none');
    makeBar('minutes', 'Uur', 0, toMs(1, 0), toMs(0, m, s, ms), '', '', 'm:s', 'none');
    if (toMs(h, m) >= toMs(7, 30) && toMs(h, m) <= toMs(17, 0)) {
        makeBar('workday', 'Dag', toMs(8, 30), toMs(17, 30), toMs(h, m, s, ms), '', '', 'm:s', 'none');
    } else {
        hideBar('workday');
    }
}

function hideBar(workday) {
    thisID = '#' + id;
    if ($(thisID).length) {
        $(thisID).hide();
    }
}

function makeBar(id, label, start, end, now, startLabel, endLabel, format, ease) {
    /*
        Gegeven: 
            - #id
            - algemeen label
            - start (ms)
            - end (ms)
            - now
            - start label
            - end label
            - format: s.ms, ...
            - ease: 'square', ...
        Maak:
            - balk leeg
            - daarover balk vol tot perc
            - op perc bol met glow
            - boven links label
            - boven rechts percentage
            - onder links begin
            - onder rechts einde
    */

    thisID = '#' + id;
    percentagedone = (now - start) / (end - start) * 100;

    switch (ease) {
        case 'square':
            percentagedone = Math.pow(percentagedone, 2) / 100;
            break;
        case 'cubic':
            percentagedone = Math.pow(percentagedone, 3) / 10000;
            break;
        default:
    }
    percentagedone = percentagedone.toPrecision(5) + '%';

    donelabel = formatDoneLabel(format, end, start, now);

    if ($(thisID).length) {
        $(thisID).show();
        $(thisID + ' .percentagedone').css('width', percentagedone);
        $(thisID + ' .label .right').text(donelabel);
    } else {
        bar = '<div id="' + id + '"></div>';
        $('#content').append(bar);
        $(thisID).append('<div class="label"><div class="left">' + label + '</div><div class="right">' + donelabel + '</div>');
        $(thisID).append('<div class="total"><div class="percentagedone"></div></div></div>');
    }
}

function formatDoneLabel(format, end, start, now) {
    ms = end - now;
    switch (format) {
        case 'ms':
            donelabel = ms;
            donelabel = 'nog ' + doPad(donelabel, 3) + ' ms ';
            break;
        case 's.ms':
            s = parseInt(ms / 1000);
            ms -= s * 1000;
            donelabel = 'nog ' + s + '.' + doPad(ms, 3) + ' seconden';
            break;
        case 'm:s':
            m = parseInt(ms / (60 * 1000));
            ms -= m * 60 * 1000;
            s = parseInt(ms / 1000);
            donelabel = 'nog ' + m + ' ';
            donelabel += checkPlural('minuut|minuten', m);
            donelabel += ' ' + s + ' ';
            donelabel += checkPlural('seconde|seconden', s);
            break;
        default:
            donelabel = percentagedone;
    }
    return donelabel;
}

function doPad(i, ln) {
    return i.toString().length < ln ? "0".repeat(ln - i.toString().length) + i : i;
}

function toMs(h, m, s, ms) {
    ret = 0;
    if (ms) { ret += ms; }
    if (s) { ret += s * 1000; }
    ret += m * 60 * 1000;
    ret += h * 60 * 60 * 1000;
    return ret;
}

function checkPlural(options, nbr) {
    options = options.split('|');
    if (nbr == 1) { return options[0]; } else { return options[1]; }
}