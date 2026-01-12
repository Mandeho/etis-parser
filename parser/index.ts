import puppeteer, {Browser, Page} from "puppeteer";
import urls from "./src/urls.js"
import selectors from "./src/selectors.js"

import { configDotenv } from "dotenv";
configDotenv()

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

class EtisParser {
    browser: Browser;
    page: Page;
    e_login = ""
    e_password = ""

    session_cookie = {}

    constructor(login: string, password: string) {
        this.e_login = login;
        this.e_password = password;
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--ignore-certificate-errors'],
        });

        this.page = await this.browser.newPage()
       
        await this.page.goto(urls.timetable);
        await this.login()

        await this.page.waitForSelector(selectors.timetable);

        await this.getSessionCookie()

        return this;
    }

    async login() {
        await this.page.evaluate((login, password, selectors) => {
            let form = document.querySelector(selectors.login.form) as HTMLFormElement

            if (form) {
                let loginInput = form.querySelector(selectors.login.login) as HTMLInputElement
                let passwordInput = form.querySelector(selectors.login.password) as HTMLInputElement

                loginInput.value = login;
                passwordInput.value =  password;

                form.submit()
            }

        }, this.e_login, this.e_password, selectors);


    }

    async parseTimetable(week?: number): Promise<TimeTableDay[]> {
        const url = urls.timetable + (week ? `?p_week=${week}` : "") 
        await this.checkUrl(url);

        return await this.page.evaluate((selectors) => {
            let timetable_data: TimeTableDay[] = []

            let timetable = document.querySelector(selectors.timetable) as HTMLDivElement;

            let days = timetable.children;

            for (let day of days) {
                let full_data: TimeTableDay = {
                    title: (day.children[0] as HTMLHeadingElement).innerText,
                    pairs: [],
                    no_pairs: false
                }
                let pairs_elem = day.children[1];

                if (pairs_elem.className === "no_pairs") {
                    full_data.no_pairs = true;
                    timetable_data.push(full_data);
                    continue;
                }

                let pairs = pairs_elem.querySelector(selectors.pairs) as HTMLTableSectionElement;

                for (let pair of pairs.children) {
                    let pair_num = (pair.children[0] as HTMLTableCellElement).innerText;
                    let pair_info = (pair.children[1] as HTMLTableCellElement).innerText;

                    let pair_link = (pair.querySelector(selectors.pair_link) as HTMLAnchorElement)
                    

                    let pair_num_splited = pair_num.split("\n");
                    let pair_info_splited = pair_info.split("\n");

                    let pair_data: Pair = {
                        num: pair_num_splited[0],
                        time: pair_num_splited[1],

                        teacher: pair_info_splited[0],
                        pair: pair_info_splited[2],
                        auditorium: pair_link ? pair_link.href : pair_info_splited[3],
                        distance: !!pair_link
                    }
                    full_data.pairs.push(pair_data);
                }
                timetable_data.push(full_data);

            }
            return timetable_data
        }, selectors)
    }

    async getSessionCookie() {

        let cookies = await this.browser.cookies()

        if (cookies.length === 0 ) {return null}

        for (let cookie of cookies) {
            if (cookie.name === "session_id") {
                this.session_cookie = cookie
                return cookie;
            }
        }
        return null;

    }

    async checkUrl(url: string) {
        if (this.page.url() !== url) {
            await this.page.goto(url);
        }
    }

    async close() {
        await this.browser.close();

    }
}