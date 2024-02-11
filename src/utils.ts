const EST = new Intl.DateTimeFormat('en-US', {
    timeZone: "America/New_York"
});

export function createWeeks(startDate, endDate) {
    var start = startDate
    var end = new Date(endDate)
    var result: [string, string][] = []; // Explicitly define the type of the result array
    // Copy start date
    var current = new Date(start);
    // While less than end date, add dates to result array
    while (current <= end) {
        var temp = new Date(current)
        current.setDate(current.getDate() + 7);
        result.push([temp.toString().substring(4, 10), current.toString().substring(4, 10)]);
    }
    result.pop()
    return result
}