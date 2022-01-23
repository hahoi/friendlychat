//console.log(JSON.stringify(Object, null, "  "));
//  const aCopyObj = JSON.parse(JSON.stringify(aObj))

//樹狀JSON深層拷貝
export function deepCopy(obj) {
    // basic type deep copy
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return obj
    }
    // array deep copy
    if (obj instanceof Array) {
        let cloneA = [];
        for (var i = 0; i < obj.length; ++i) {
            cloneA[i] = deepCopy(obj[i]);
        }
        return cloneA;
    }
    // object deep copy
    let cloneO = {};
    for (var i in obj) {
        cloneO[i] = deepCopy(obj[i]);
    }
    return cloneO;
}

//=======一維陣列 => 樹狀 ====//問題 children 會重複拷貝，顯示的tree會越來越大==============
//使用前要先深拷貝Array，再轉換成為Tree
export function arrayToTree(treeArray) {
    let r = []
    let tmpMap = {};

    for (let i = 0, l = treeArray.length; i < l; i++) {
        // 以每条数据的id作为obj的key值，数据作为value值存入到一个临时对象里面
        //将nodes数组转成对象类型 array => object {1234567890: treeArray[i] }
        tmpMap[treeArray[i]["id"]] = treeArray[i];
    }
    for (let i = 0, l = treeArray.length; i < l; i++) {
        let key = tmpMap[treeArray[i]["pid"]]; //获取每一个子对象的父对象

        //循环每一条数据的pid，假如这个临时对象有这个key值，就代表这个key对应的数据有children，需要Push进去
        if (key) { //判断父对象是否存在，如果不存在直接将对象放到第一层
            if (!key["children"]) key["children"] = []; //如果父元素的children对象不存在，则创建数组
            key["children"].push(treeArray[i]); //将本对象压入父对象的children数组
        } else {
            //如果没有这个Key值，那就代表没有父级,直接放在最外层 放入一级目录
            r.push(treeArray[i]);
        }
    }
    return r
}


//=======一維陣列 => 樹狀 ====purePush 跟arrayToTree沒什麼差別============
export function arrayToTreePure(treeArray) {
    let r = []
    let tmpMap = {};
    const purePush = (aArray, newEntry) => [...aArray, newEntry]

    for (let i = 0, l = treeArray.length; i < l; i++) {
        // 以每条数据的id作为obj的key值，数据作为value值存入到一个临时对象里面
        //将nodes数组转成对象类型 array => object {1234567890: treeArray[i] }
        tmpMap[treeArray[i]["id"]] = treeArray[i];
    }
    for (let i = 0, l = treeArray.length; i < l; i++) {
        let key = tmpMap[treeArray[i]["pid"]]; //获取每一个子对象的父对象

        //循环每一条数据的pid，假如这个临时对象有这个key值，就代表这个key对应的数据有children，需要Push进去
        if (key) { //判断父对象是否存在，如果不存在直接将对象放到第一层
            if (!key["children"]) key["children"] = []; //如果父元素的children对象不存在，则创建数组
            // key["children"].push(treeArray[i]); //将本对象压入父对象的children数组
            key["children"] = purePush(key["children"], treeArray[i])
        } else {
            //如果没有这个Key值，那就代表没有父级,直接放在最外层 放入一级目录
            // r.push(treeArray[i]);
            r = purePush(r, treeArray[i])
        }
    }
    return r
}
//列出節點的路徑，這邊是用name當路徑名稱
export function parsePath(data = [], node = {}, pathName = 'name') {
    let parent;
    let path=[]
    let cid = node.id; //子级id
    const parents = [];
    do {
        for (const v of data) {
            if (v.id === cid) {
                parent = v; // 子级数据
            }
        }
        if (parent && parent.pid) {

            cid = parent.pid; // 父级id
            for (const v of data) {
                if (v.id === cid) {
                    parents.push(v); // 父级数据
                    path.unshift(v[pathName]) //用name當路徑名稱
                }
            }
        }
    }
    while (parent && parent.pid);//注意parent.pid=null 停止迴圈的值
    return path;



}

// let array5 = parsePath(array4)
// console.log(array5);
// console.log(array5.join("/"));
//array to tree

// 获取所有父级
export function getTreeParents(data = [], node = {}) {
    let parent;
    let cid = node.id; //子级id
    const parents = [];
    do {
        for (const v of data) {
            if (v.id === cid) {
                parent = v; // 子级数据
            }
        }
        if (parent && parent.pid) {
            cid = parent.pid; // 父级id
            for (const v of data) {
                if (v.id === cid) {
                    parents.push(v); // 父级数据
                }
            }
        }
    }
    while (parent && parent.pid);
    return parents;
}


// 获取所有子级
export function getTreeAllChildren(data = [], node = {}) {
    const children = [];
    for (const v of data) {
        if ((v.pid === node.id)) {
            children.push(v); // node的直属父级
            const subs = getTreeAllChildren(data, v);
            if (subs) {
                children.push(...subs);
            }
        }
    }
    return children;
}

//陣列合併，剔除重複的值
export function Array_unique(a) {
    var a = a.concat();//使用concat()再複製一份陣列，避免影響原陣列
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j, 1);
        }
    }

    return a;
}
// var arr1=["a","b"];
// var arr2=["b","c"];
// var arr3 = my_unique(arr1.concat(arr2));//得到["a","b","c"]

// 使用範例
// let node = {
// 	id: 2,
// 	name: '哥哥',
// 	pid: 1}

// let array1 = getTreeParents(data,node)
// let array2 = getTreeAllChildren(data,node)
// let array3=my_unique(array1.concat(array2).concat(node))
//將此節點的父级、子级、自己组合到一起，就是我们想要的结果。
// let array4 = [...array1,node,...array2]
// console.log(array4)
// console.log(getTree(array4))


export function getTree(data = [], sid, pid = null) {
    const children = [];
    for (const i in data) {
        const node = data[i];
        if (((!pid && !node.pid) || node.pid === pid) && node.id !== sid) {
            // key, value, label 這裡是添加的属性。若有需求，可任意添加
            children.push({
                key: node.id,
                value: node.id + '',
                label: node.name,
                children: this.getTree(data, sid, node.id),
                ...node
            });
        }
    }
    return children.length ? children : undefined;
}

// let tree =getTree(data)
// console.log(tree)




//======= 二維陣列轉成一維陣列 ============
export function twoDim_to_oneDim(numbers) {
    return result = [].concat.apply([], numbers)
}
    // var numbers=[ [1, 3], [5, 7], [9] ];
    // var result=[].concat.apply([], numbers);
    // console.log(result);
    // // [1, 3, 5, 7, 9]

    // var numbers=[ [1, 3], [5, 7], [9] ];
    // var result=numbers.reduce(function(previousValue, currentValue, currentIndex, array){
    //     return previousValue.concat(currentValue);
    // }, []);
    // console.log(result);
    // [1, 3, 5, 7, 9]