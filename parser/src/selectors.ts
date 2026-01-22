
export default {
    timetable: {
        days: "body > div.container > div > div.span9 > div.timetable > div.day",
        pairs: "div > table > tbody > tr",
        day_title: "div > h3",
        pair_num: "tr > td.pair_num",
        pair_time: "tr > td.pair_num > font",
        pair_info: {
            pair_info: "tr > td.pair_info",
            teacher: " div > div:nth-child(1) > span.teacher > a:nth-child(1)",
            pair_name: "div > div:nth-child(1) > span.dis",
            aud: "div > div:nth-child(2) > span, div > div:nth-child(2) > span > a",
        },
    },
    login: {
        form: "#form",
        login: "#login",
        password: "#password",
    }
}