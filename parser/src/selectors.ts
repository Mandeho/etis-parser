
export default {
    timetable: {
        timetable: "body > div.container > div > div.span9 > div.timetable",
        pairs: "div > table > tbody",
        pair_num: "tr > td.pair_num",
        pair_info: {
            teacher: "tr > td.pair_info > div > div:nth-child(1) > span.teacher > a:nth-child(1)",
            pair: "tr > td.pair_info > div > div:nth-child(1) > span.dis > a",
            aud: "tr > td.pair_info > div > div:nth-child(2) > span",
            dist: "tr > td.pair_info > div > div:nth-child(2) > span > a"
        },
    },
    login: {
        form: "#form",
        login: "#login",
        password: "#password",
    }
}