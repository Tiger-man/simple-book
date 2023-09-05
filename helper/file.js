const FileHelper = {
  fileContent: null,
  chapterList: [],
  chapterIndex: 1,
  // 读取文件信息
  readFile: async function (file) {
    if (!file) throw Error('not read any text')
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        this.fileContent = content
        resolve(content)
      };
      reader.onerror = (e) => {
        console.log("read file error")
        reject(e)
      }

      // const jschardet = new JSChardet();
      // console.log(jschardet.detect)
      // const a = jschardet.detect(file);
      // console.log(a)
      reader.readAsText(file, 'GBK');
      // const encodingsToTry = ['UTF-8', 'ISO-8859-1', 'UTF-16', 'GBK'];

    })
  },
  replaceNR: function (str) {
    return str.replace(/\s/g, '')
  },
  // 获取章节列表
  getChapterList: async function () {
    this.chapterList = []
    this.chapterIndex = 1
    return new Promise((resolve, reject) => {
      try {
        const text = this.fileContent
        let match;
        const regex = /第(\d+)章\s+([\s\S]+?)(?=\n|$)/g;
        const chapter = []
        while ((match = regex.exec(text)) !== null) {
          const title = match[0];
          const chapterNumber = parseInt(match[1], 10); // 获取章节数码
          const chapterName = match[2]; // 获取章节名称
          const startIndex = match.index;
          const endIndex = startIndex + title.length;
          chapter.push({
            title,
            startIndex,
            endIndex,
            chapterNumber,
            chapterName: this.replaceNR(chapterName)
          })
        }
        this.chapterList = chapter
        resolve(chapter)
      } catch (error) {
        console.error("getChapterList catch error:", error)
        reject(error)
      }
    })
  },
  // 获取章节内容
  getChapter() {
    let chapterIndex = this.chapterIndex
    if (chapterIndex <= 1) {
      this.chapterIndex = 1
      chapterIndex = 1
    }
    const { chapterList, fileContent } = this
    if (!fileContent) {
      throw Error("未读取到文件信息")
    }
    if (!chapterList.length) {
      throw Error("未读取到章节目录")
    }
    const result = { chapterName: '', chapterNumber: '', chapterContent: '', title: '' }
    const [chapter, nextChapter] = [chapterList[chapterIndex - 1], chapterList[chapterIndex]]
    if (chapter) {
      result.chapterName = chapter.chapterName
      result.chapterNumber = chapter.chapterNumber
      result.title = chapter.title
      let chapterContent = fileContent.substring(chapter.endIndex, nextChapter.startIndex || undefined)

      const regex = /([\s\S]+?)(?=\n|$)/g;
      const content = []
      let match = null
      while ((match = regex.exec(chapterContent)) !== null) {
        const paragraph = this.replaceNR(match[0])
        content.push(`<p>${paragraph}</p>`)
      }

      result.chapterContent = content.join("")
    }
    return result
  },
  // 获取下一张内容
  getNextChapter() {
    this.chapterIndex++
    return this.getChapter()
  },
  // 获取下一张内容
  getLatestChapter() {
    this.chapterIndex--
    return this.getChapter()
  },
  // 跳转到指定章节
  getAimChapter(chapterIndex) {
    this.chapterIndex = chapterIndex
    return this.getChapter()
  }
}