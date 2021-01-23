const puppeteer = require('puppeteer')
const getMetaDataFromBeatport =  async (songTitle, songLabel, songDate) => {
    let searchURL = 'https://www.beatport.com/search?q=' + songTitle

    let browser = await puppeteer.launch()
    let page = await browser.newPage()

    await page.goto(searchURL, { waitUntil: 'networkidle2' })
    await page.waitForSelector('ul.bucket-items.ec-bucket')
    const song = {
        songLabel,
        songDate: songDate[0][0]
    }
    const targetAudioUrlData = await page.evaluate((song) => {
        let numberOfItem = document.querySelector('ul.bucket-items.ec-bucket').getElementsByTagName("li").length
        for (let i = 1; i <= numberOfItem; i++) {
            let label = document.querySelector('ul.bucket-items.ec-bucket li:nth-child(' + i + ') .buk-track-labels a').innerHTML
            let data = document.querySelector('ul.bucket-items.ec-bucket li:nth-child(' + i + ') .buk-track-released').innerHTML
            if (label === song.songLabel && data === song.songDate) {
                let songUrl = document.querySelector('ul.bucket-items.ec-bucket li:nth-child(' + i + ') .buk-track-title a').href
                let labelUrl = document.querySelector('ul.bucket-items.ec-bucket li:nth-child(' + i + ') .buk-track-labels a').href
                return {
                    songUrl,
                    labelUrl
                }
            }
        }
    }, song)

    await page.goto(targetAudioUrlData.songUrl, { waitUntil: 'networkidle2' })
    const INITIALKEY =  await page.evaluate(() => {
        return document.querySelector('#pjax-inner-wrapper > section > main > div.interior-track-content > div > ul.interior-track-content-list > li.interior-track-content-item.interior-track-key > span.value').innerHTML.replace(/\s/g, '')
    })

    await browser.close()

    const data = {
        FILEWEBPAGE: '\x03http://' + targetAudioUrlData.songUrl.split('ttps://')[1],
        PUBLISHERWEBPAGE: '\x03http://' + targetAudioUrlData.labelUrl.split('ttps://')[1],
        INITIALKEY
    }

    return data
}

module.exports = { getMetaDataFromBeatport }
