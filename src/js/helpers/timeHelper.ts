/**
 * Formats the time in seconds to a readable format
 * @param seconds 
 * @returns 
 */
export function formatTime(seconds: string) {
    const sec_num = parseInt(seconds, 10); // don't forget the second param
    const h = Math.floor(sec_num / 3600);
    const m = Math.floor((sec_num - (h * 3600)) / 60);
    const s = sec_num - (h * 3600) - (m * 60);

    let hrs = "";
    let mins = "";
    let secs = "";

    //If hours eq 0, hide it
    if (h > 0) {
        if (h < 10) {
            hrs = "0" + h + ":";
        } else {
            hrs = h + ":";
        }
    }

    // Check if minutes and seconds are less then 10
    // if so, prepend a 0
    mins = (m < 10) ? "0" + m : "" + m;
    secs = (s < 10) ? "0" + s : "" + s;

    return hrs + mins + ':' + secs;
}