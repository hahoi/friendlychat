export default {

    //中文字元擷取
    substr(str, len) {
        if (!str || !len) { return ''; }
        //預期計數：中文2位元組，英文1位元組    
        var a = 0;      //迴圈計數    
        var i = 0;      //臨時字串    
        var temp = '';
        for (i = 0; i < str.length; i++) {
            if (str.charcodeat(i) > 255) {             //按照預期計數增加2           
                a += 2;
            }
            else {
                a++;
            }         //如果增加計數後長度大於限定長度，就直接返回臨時字串        
            if (a > len) { return temp; }          //將當前內容加到臨時字串        
            temp += str.charat(i);
        }     //如果全部是單位元組字元，就直接返回源字串    
        return str;
    },
    cutStr(str, len) {
        try {
            if (str.length > len) {
                return str.substring(0, len) + '...'
            }
            return str
        } catch (e) {
            return ""
        }
    },
    verifyEmail(str) {
        if (str == null || str == undefined) {
            return false
        }
        let reg = /^[0-9A-Za-z_]+@[0-9A-Za-z]+\.[A-Za-z]+/
        return reg.test(str)
    },
    //yyyy-MM-ddThh-mm-ss.*
    utcToLocal(time) {
        let formatNum = (num) => {
            return num >= 10 ? num : ('0' + num)
        }
        let arr = time.split(/[^0-9]/)
        let worldDate = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5])
        let localDate = new Date(worldDate.getTime() + 8 * 60 * 60 * 1000)
        return formatNum(localDate.getFullYear()) + "-"
            + formatNum((localDate.getMonth() + 1)) + "-"
            + formatNum(localDate.getDate()) + " "
            + formatNum(localDate.getHours()) + ":"
            + formatNum(localDate.getMinutes()) + ":"
            + formatNum(localDate.getSeconds())
    },
    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    },
    //s<=r<e
    randomInt(s, e) {
        let d = e - s
        if (d < 0) {
            return s
        }
        let r = Math.random() * d + s
        r = parseInt(r, 10)
        return r
    },

    copy(message) {
        let doc = document.createElement("input")
        doc.value = message
        document.body.appendChild(doc)
        doc.select()
        let status
        try {
            status = document.execCommand('copy')
        } catch (e) {
            // console.log(e)
        }
        document.body.removeChild(doc)
        return status
    },
    formatTime(time) {
        let it = parseInt(time)
        let m = parseInt(it / 60)
        let s = parseInt(it % 60)

        return (m < 10 ? "0" : "") + parseInt(it / 60) + ":" + (s < 10 ? "0" : "") + parseInt(it % 60)
    },
    getWindowSize() {
        let windowSize = {}
        windowSize.width = window.innerWeight || document.documentElement.clientWidth || document.body.clientWidth
        windowSize.height = window.innerWeight || document.documentElement.clientHeight || document.body.clientHeight
        return windowSize
    },
    addHttp(url) {
        return (url.match(/https?:\/\//i) ? '' : 'https://') + url
    },


    //陣列處理純粹函式
    //注意它並非回傳長度，而是回傳最終的陣列結果
    //const purePush = (aArray, newEntry) => [ ...aArray, newEntry ]
    purePush(aArray, newEntry) {
        return [...aArray, newEntry]
    },
    //注意它並非回傳pop的成員(值)，而是回傳最終的陣列結果
    //const purePop = aArray => aArray.slice(0, -1)
    purePop(aArray) {
        return aArray.slice(0, -1)
    },

    // shift
    //注意它並非回傳shift的成員(值)，而是回傳最終的陣列結果
    // const pureShift = aArray => aArray.slice(1)
    pureShift(aArray) {
        return aArray.slice(1)
    },

    // unshift
    //注意它並非回傳長度，而是回傳最終的陣列結果
    // const pureUnshift = (aArray, newEntry) => [ newEntry, ...aArray ]
    pureUnshift(aArray, newEntry) {
        return [newEntry, ...aArray]
    },

    // splice
    // 這方法完全要使用slice與展開運算符(...)來取代，是所有的純粹函式最難的一個。
    // const pureSplice = (aArray, start, deleteCount, ...items) =>
    // [ ...aArray.slice(0, start), ...items, ...aArray.slice(start + deleteCount) ]
    pureSplice(aArray, start, deleteCount, ...items) {
        return [...aArray.slice(0, start), ...items, ...aArray.slice(start + deleteCount)]
    },

    // sort
    //無替代語法，只能拷貝出新陣列作sort
    // const pureSort = (aArray, compareFunction) => [ ...aArray ].sort(compareFunction)
    pureSort(aArray, compareFunction) {
        return [...aArray].sort(compareFunction)
    },

    // reverse
    //無替代語法，只能拷貝出新陣列作reverse
    // const pureReverse = aArray => [ ...aArray ].reverse()
    pureReverse(aArray) {
        return [...aArray].reverse()
    },

    // delete
    // 刪除(delete)其中一個成員，再組合所有子字串:
    // const pureDelete = (aArray, index) => aArray.slice(0,index).concat(aArray.slice(index+1))
    pureDelete(aArray, index) {
        return aArray.slice(0, index).concat(aArray.slice(index + 1))
    },









}