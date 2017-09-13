function startTime() {
    var now = new Date();

    var yy = now.getFullYear();
    var mm = now.getMonth() + 1;
    var dd = now.getDate();
    var d = now.getDay();
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();
    var ms = now.getMilliseconds();

    var t = setTimeout(startTime, 1);

    var startOfDay = toMs(8, 30);
    var endOfDay = toMs(17, 0);
    var noonBreak = toMs(12, 5);
    var birthDate = new Date(1970, 8, 27);

    var startOfYear = new Date(yy, 1, 1, 0, 0, 0, 1) - 1;
    var endOfYear = new Date(yy + 1, 1, 1, 0, 0, 0, 0) - 1;
    var pensionDate = new Date(birthDate.getFullYear() + 67, birthDate.getMonth(), birthDate.getDate());

    $("#now").html(dd + "/" + mm + "/" + yy + " " + h + ":" + doPad(m, 2) + ":" + doPad(s, 2) + "." + doPad(ms, 3));

    makeBar('milliseconds2', 'Seconde', 0, 1000, ms, '', '', 'ms', 'square');
    makeBar('seconds', 'Minuut', 0, toMs(0, 1), toMs(0, 0, s, ms), '', '', 's.ms', 'none');
    makeBar('minutes', 'Uur', 0, toMs(1, 0), toMs(0, m, s, ms), '', '', 'm:s', 'none');
    makeBar('day', 'Dag', toMs(0, 0), toMs(24, 0), toMs(h, m, s, ms), '', '', 'percentage', 'none');
    if (toMs(h, m, s, ms) >= startOfDay && toMs(h, m, s, ms) <= endOfDay) {
        if (toMs(h, m, s, ms) <= noonBreak) {
            makeBar('morning', 'Schaft', startOfDay, noonBreak, toMs(h, m, s, ms), '', '', 'h:m', 'none');
        }
        makeBar('workday', 'Werkdag', startOfDay, endOfDay, toMs(h, m, s, ms), '', '', 'percentageleft', 'none');
        makeBar('workweek', 'Werkweek', 0, (endOfDay - startOfDay) * 5, (endOfDay - startOfDay) * (d - 1) + (toMs(h, m, s, ms) - startOfDay), '', '', 'percentageleft', 'none');
    } else {
        if (toMs(h, m, s, ms) < startOfDay) {
            day = d - 1;
        } else {
            day = d;
        }
        makeBar('workweek', 'Werkweek', 0, (endOfDay - startOfDay) * 5, (endOfDay - startOfDay) * day, '', '', 'percentageleft', 'none');
        hideBar('workday');
    }
    makeBar('week', 'Week', toMs(0, 0), toMs(24, 0) * 7, toMs(24, 0) * (d - 1) + toMs(h, m, s, ms), '', '', 'percentageleft', 'none', 6);
    makeBar('month', 'Maand', toMs(0, 0), toMs(24, 0) * daysInMonth(now), toMs(24, 0) * (dd - 1) + toMs(h, m, s, ms), '', '', 'percentageleft', 'none', 7);
    makeBar('year', 'Jaar', startOfYear, endOfYear, now, '', '', 'percentageleft', 'none', 8);
    makeBar('pension', 'Pensioen', birthDate, pensionDate - birthDate, now - birthDate, '', '', 'percentage', 'none', 10);

}

function hideBar(id) {
    thisID = '#' + id;
    if ($(thisID).length) {
        $(thisID).hide();
    }
}

function makeBar(id, label, start, end, now, startLabel, endLabel, format, ease, precision) {
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

    donelabel = formatDoneLabel(format, end, start, now, precision);

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

function formatDoneLabel(format, end, start, now, precision) {
    if (!precision) precision = 5;
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
        case 'h:m':
            h = parseInt(ms / (60 * 60 * 1000));
            ms -= h * 60 * 60 * 1000;
            m = parseInt(ms / (60 * 1000));
            ms -= m * 60 * 1000;
            donelabel = 'nog ';
            if (h > 0) { donelabel += h + ' uur '; }
            donelabel += m + ' ';
            donelabel += checkPlural('minuut|minuten', m);
            break;
        case 'h:m:s':
            h = parseInt(ms / (60 * 60 * 1000));
            ms -= h * 60 * 60 * 1000;
            m = parseInt(ms / (60 * 1000));
            ms -= m * 60 * 1000;
            s = parseInt(ms / 1000);
            donelabel = 'nog ';
            if (h > 0) { donelabel += h + ' uur '; }
            if (m > 0) {
                donelabel += m + ' ';
                donelabel += checkPlural('minuut|minuten', m);
            }
            donelabel += ' ' + s + ' ';
            donelabel += checkPlural('seconde|seconden', s);
            break;
        case 'm:s':
            m = parseInt(ms / (60 * 1000));
            ms -= m * 60 * 1000;
            s = parseInt(ms / 1000);
            donelabel = 'nog ';
            if (m > 0) {
                donelabel += m + ' ';
                donelabel += checkPlural('minuut|minuten', m);
            }
            donelabel += ' ' + s + ' ';
            donelabel += checkPlural('seconde|seconden', s);
            break;
        case 'percentageleft':
            donelabel = 100 - (now - start) / (end - start) * 100;
            donelabel = 'nog ' + donelabel.toPrecision(precision) + '%';
            break;
        default:
            donelabel = now / (end - start) * 100;
            donelabel = donelabel.toPrecision(precision) + '%'
    }
    return donelabel;
}

function daysInMonth(date) {
    return new Date(date.getYear(),
        date.getMonth() + 1,
        0).getDate();
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