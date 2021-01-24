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
                let trackBeatportID = songUrl.split('/')[5]
                return {
                    songUrl,
                    labelUrl,
                    trackBeatportID
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
        INITIALKEY,
        trackBeatportID: targetAudioUrlData.trackBeatportID
    }

    return data
}

const downloadCoverImageFromAppleMusic = async (albumTitle, albumArtist) => {
    const albumArtistArray = albumArtist.split(', ')
    const albumTitleFineFix = albumTitle.split(' - ')[0]
    const searchURL = 'https://music.apple.com/au/search?term=' + albumTitle

    let browser = await puppeteer.launch()
    let page = await browser.newPage()

    await page.goto(searchURL, { waitUntil: 'networkidle2' })
    await page.waitForSelector('#web-main > div.loading-inner > div > div.search__search-hits > div.dt-shelf.divider-before.dt-shelf--search-album > div > div.shelf-grid__body > ul')

    const song = {
        albumTitleFineFix,
        albumArtistArray
    }

    const imageUrl = await page.evaluate((song) => {
        // use for replacing special letters
        const specialLetterReplace = (str) => {
            str.replace(/è/g, 'e')
            str.replace(/é/g, 'e')

            return str
        }
        // use for replacing special letters

        let numberOfItem = document.querySelector('#web-main > div.loading-inner > div > div.search__search-hits > div.dt-shelf.divider-before.dt-shelf--search-album > div > div.shelf-grid__body > ul').getElementsByTagName("li").length
        for (let i = 1; i <= numberOfItem; i++) {
            let songTitle = document.querySelector('#web-main > div.loading-inner > div > div.search__search-hits > div.dt-shelf.divider-before.dt-shelf--search-album > div > div.shelf-grid__body > ul li:nth-child(' + i + ')  a.line.lockup__name').innerHTML
            let artist = document.querySelector('#web-main > div.loading-inner > div > div.search__search-hits > div.dt-shelf.divider-before.dt-shelf--search-album > div > div.shelf-grid__body > ul li:nth-child(' + i + ')  a.dt-link-to.line2.linkable').innerHTML


            if (specialLetterReplace(songTitle.toLowerCase()).includes(specialLetterReplace(song.albumTitleFineFix.toLowerCase()))) {
                for (albumArtist of song.albumArtistArray) {
                    if (specialLetterReplace(artist.toLowerCase()).includes(specialLetterReplace(albumArtist.toLowerCase()))) {
                        let datasrc = document.querySelector('#web-main > div.loading-inner > div > div.search__search-hits > div.dt-shelf.divider-before.dt-shelf--search-album > div > div.shelf-grid__body > ul li:nth-child(' + i + ') .dt-lockup__artwork picture source').srcset
                        let imageUrl = datasrc.split(', ')[0].split(' ')[0].replace(/\/(?:.(?!\/))+$/,'/2000x2000bb.webp')
                        return {
                            titleFromApple: songTitle.toLowerCase(),
                            title: song.albumTitleFineFix.toLowerCase(),
                            artistFromApple: artist.toLowerCase(),
                            artist: albumArtist.toLowerCase(),
                            imageUrl
                        }
                    }
                }
            }
            if (i >= 4) break
        }
        return -1
    }, song)
    // await page.goto(imageUrl, { waitUntil: 'networkidle2' })
    // console.log('=====================================================')
    // console.log(imageUrl)
    // console.log('=====================================================')
    await browser.close()

    return imageUrl.imageUrl
}

module.exports = { getMetaDataFromBeatport, downloadCoverImageFromAppleMusic }
