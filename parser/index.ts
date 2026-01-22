import urls from "./src/urls.js"
import selectors from "./src/selectors.js"
import service from "./src/service.js";

import {load} from "cheerio";
import {decode} from "iconv-lite";

interface TimeTableDay {
    title: string
    pairs: Pair[],
    no_pairs: boolean
}

interface Pair {
    num: string
    time: string

    distance: boolean
    pair: string
    teacher: string
    auditorium: string
}

export default class EtisParser {
    e_login = ""
    e_password = ""
    session_cookie =  "session_id=32453397gpOJjnIedKgeLokpaRmJqcParvgxObUFEKEWOWfj"

    constructor(login: string, password: string) {
        this.e_login = login
        this.e_password = password
    }

    async init() {
        if (!this.session_cookie) {
            console.log("The user is not logged in")
            await this.login()
        }
        else {
            console.log("The user is already logged in")
            service.setSessionCookie(this.session_cookie)
        }

        return this;
    }

    async login() {
        let formData = "p_redirect=" +
            `&p_username=${this.e_login}` +
            `&p_password=${this.e_password}`

        let result = await service.post(
            urls.login,
            formData
        )

        let cookie = result.headers["set-cookie"][0]
        if (cookie) {
            this.session_cookie = cookie.split(';')[0]
            service.setSessionCookie(this.session_cookie)
        }
        else {
            throw new Error("Could not get session cookie. Check your login or password.");
        }
    }

    async parseTimetable(week?: number): Promise<TimeTableDay[]> {
        const url = urls.timetable + (week ? `?p_week=${week}` : "")

        let request = await service.get(url);
        let parsed_timetable: TimeTableDay[] = []
        let $ = load(decode(Buffer.from(request.data), 'cp1251'))

        let timetableElem = $(selectors.timetable.days)
        timetableElem.each((i, day)=> {

            let day_elem = $(day)
            let day_data: TimeTableDay = {
                title: day_elem.find(selectors.timetable.day_title).text(),
                pairs: [],
                no_pairs: false,
            }

            let pairs_list = day_elem.find(selectors.timetable.pairs)
            if (pairs_list.hasClass("no_pairs")) {
                day_data.no_pairs = true;
                parsed_timetable.push(day_data);
                return
            }

            pairs_list.each((i, pair) => {
                let pair_elem = $(pair)
                let pair_num = pair_elem.find(selectors.timetable.pair_num).contents().first().text()
                let pair_time = pair_elem.find(selectors.timetable.pair_time).text()

                let teacher = pair_elem.find(selectors.timetable.pair_info.teacher).text()
                let pair_name = pair_elem.find(selectors.timetable.pair_info.pair_name).text().replaceAll("\n", "")
                let aud_el = pair_elem.find(selectors.timetable.pair_info.aud)

                let aud =  aud_el.text().replaceAll("\n", "")
                let aud_link = aud_el.children().first().attr()?.href
                if (aud_link) {
                    aud = aud_link
                }

                let pair_data: Pair = {
                    num: pair_num,
                    time: pair_time,
                    teacher: teacher,
                    pair: pair_name,
                    auditorium: aud,
                    distance: !!aud_link
                }
                day_data.pairs.push(pair_data)
            })
            parsed_timetable.push(day_data)
        })

        return parsed_timetable;
        }
    }