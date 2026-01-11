import puppeteer, {Browser, Page} from "puppeteer";
import urls from "./src/urls.js"
import selectors from "./src/selectors.js"


console.log(urls, selectors)

class EtisParser {
    browser = new Browser();
    page = new Page();
    e_login = ""
    e_password = ""

    session_cookie = {}

    constructor(login, password) {
        this.e_login = login;
        this.e_password = password;
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: false,
            args: ['--ignore-certificate-errors'],
        });

        await this.browser.setCookie({
            name: 'session_id',
            value: '32288051jnagzkvLJVtFkeGDekhcfIESAwQDOJnlneSAVFHU',
            domain: '.student.psu.ru',
            path: '/',
            expires: -1,
            size: 58,
            httpOnly: false,
            secure: false,
            session: true,
            priority: 'Medium',
            sameParty: false,
            sourceScheme: 'Secure',
            sourcePort: 443,
            partitionKey: undefined
        })

        let new_page = await this.browser.newPage()
        this.page = new_page;
        await new_page.goto(urls.timetable);
        await this.login()

        await this.page.waitForSelector(selectors.timetable);

        await this.getSessionCookie()

        return this;
    }

    async login() {
        await this.page.evaluate((login, password, selectors) => {
            let form = document.querySelector(selectors.login.form);

            if (form) {
                let loginInput = form.querySelector(selectors.login.login)
                let passwordInput = form.querySelector(selectors.login.password)

                loginInput.value = login;
                passwordInput.value =  password;

                form.submit()
            }

        }, this.e_login, this.e_password, selectors);


    }

    async parseTimetable() {
        await this.checkUrl(urls.timetable);

        return await this.page.evaluate((selectors) => {
            let timetable_data = []

            let timetable = document.querySelector(selectors.timetable);

            let days = timetable.children;

            for (let day of days) {
                let full_data = {
                    title: day.children[0].innerText,
                    pairs: [],
                    no_pairs: false
                }
                let pairs_elem = day.children[1];

                if (pairs_elem.className === "no_pairs") {
                    full_data.no_pairs = true;
                    timetable_data.push(full_data);
                    continue;
                }

                let pairs = pairs_elem.querySelector(selectors.pairs);

                for (let pair of pairs.children) {
                    let pair_num = pair.children[0].innerText;
                    let pair_info = pair.children[1].innerText;

                    let pair_num_splited = pair_num.split("\n");
                    let pair_info_splited = pair_info.split("\n");

                    let pair_data = {
                        num: pair_num_splited[0],
                        time: pair_num_splited[1],

                        teacher: pair_info_splited[0],
                        pair: pair_info_splited[2],
                        auditorium: pair_info_splited[3],

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

    async checkUrl(url) {
        if (this.page.url() !== url) {
            await this.page.goto(url);
        }
    }

    async close() {
        await this.browser.close();

    }
}


let parser = await (new EtisParser("dvilper@mail.ru", "sagasword12")).init();


console.log(await parser.parseTimetable());