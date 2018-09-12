const Nightmare = require('nightmare');
const cheerio = require('cheerio');
const fs = require('fs');

const board = "g";

const url = (board) => {
    return  'http://boards.4chan.org/' + board + '/catalog';
}

const crawlCatalogue = async() => {
    console.log("Starting crawl process for /" + board + "/");
    const nightmare = new Nightmare({ show: false });
    try {
        let threadArray = [];
        let threads = await nightmare.goto(url(board))
            .wait('#threads .thread')
            .evaluate(() => {
                let elements = Array.from(document.getElementsByClassName('thread'));
                return elements.map(elem => {
                    return {
                        content: elem.innerHTML
                    }
                });
            })
            .end()
            .then(threads => {
                console.log('Found ' + threads.length + ' threads. Mapping to objects...');
                let formatted = threads.map(item => {
                    let $ = cheerio.load(item.content);
                    data = {
                        id: $('.meta a').attr('data-post-menu'),
                        link: $('a').attr('href'),
                        img: $('img').attr('src'),
                        replies: $('.meta > b:nth-child(1)').text(),
                        imgReplies: $('.meta > b:nth-child(2)').text(),
                        title: $('.teaser > b').first().text(),
                        op: $('.teaser').text()
                    }
                    return data;
                    
                });
                return formatted;
            });
        return threads;
    } catch(err) {
        console.log(err);
    }
}

crawlCatalogue().then(response => {
    console.log('Completed with no errors! Writing file.');
    let formattedResponse = JSON.stringify(response, null, 4);
    try {
        fs.writeFileSync('log.json', formattedResponse, 'utf8');
        console.log('File output complete.');
    } catch(err) {
        if (err) throw err;
    }
    
}).catch(e => console.log(e));