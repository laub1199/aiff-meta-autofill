const taglib = require('taglib3');
// const file = './final/12371792_20_and_Lost_feat__ELVIRA_Original_Mix.aiff'

(async () => {
    const { getMetaDataFromBeatport } = require('./puppeteer')
    const file = './original/c_Elvira, Osrin - 20 and Lost feat. ELVIRA (Original Mix).aiff'
    const tags = taglib.readTagsSync(file)
    tags.ALBUMARTIST = ['']
    tags.COMMENT= ['Purchased at Beatport.com']
    tags.CONTENTGROUP = tags.LABEL
    tags.DATE = [tags.DATE[0].split("-")[0]]
    tags.ENCODEDBY = ['Beatport']
    tags.ENCODING = ['']
    tags.ISRC = ['NLM5S1900615']                                                                                            // need modify
    tags['ORIGINAL RELEASE DATE'] = [tags.ORIGINALDATE]
    tags.ORIGINALDATE = ['']
    tags.ORIGINALARTIST = ['']
    tags.RELEASEDATE = [tags['ORIGINAL RELEASE DATE']]

    const webMeta = await getMetaDataFromBeatport(tags.TITLE[0],tags.LABEL[0], tags.RELEASEDATE[0])

    let replaceTitleString = tags.TITLE[0].replace(/[\s().,@*-+#!?]/g, '_')
    let sliceindex = 0;
    for (let i = replaceTitleString.length-1; i >= 0; i++ ) {
        if (replaceTitleString.charAt(i) === '_') {
            sliceindex++
        }
        else {
            break
        }
    }
    if (sliceindex > 0) {
        sliceindex *= -1
        replaceTitleString = replaceTitleString.slice(0, sliceindex)
    }
    const newFileName = webMeta.trackBeatportID + '_' + replaceTitleString + '.aiff'

    tags.FILEWEBPAGE = [webMeta.FILEWEBPAGE]
    tags.PUBLISHERWEBPAGE = ['\x03http://www.beatport.com/label/stmpd-rcrds/56009' ]
    tags.INITIALKEY = [webMeta.INITIALKEY]
    taglib.writeTags(file, tags, (error, data) => console.log(error, data))
})()
