var startArray = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];

var endArray = [
    [1, 2, 3],
    [8, 0, 4],
    [7, 6, 5]
];

function Board(array, curStep) {
    this.state = copy(array); // 3 * 3状态
    this.eval = evalute(curStep); // 估值 
    this.hashVal = _hash(); //哈希值

    function _hash() {
        let res = 0;
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                res = res * 10 + array[i][j];
        return res;
    }

    function evalute(curStep) {
        let res = curStep;
        let curx = new Array(9), cury = new Array(9);
        let endx = new Array(9), endy = new Array(9);
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++) {
                curx[array[i][j]] = i, cury[array[i][j]] = j;
                endx[endArray[i][j]] = i, endy[endArray[i][j]] = j;
            }
        for (let i = 0; i < 9; i++) res += Math.abs(curx[i] - endx[i]) + Math.abs(cury[i] - endy[i]);
        return res;
    }

    function copy(array) {
        let tmp = new Array(3);
        for (let i = 0; i < 3; i++) {
            tmp[i] = new Array(3);
            for (let j = 0; j < 3; j++)
                tmp[i][j] = array[i][j];
        }
        return tmp;
    }

    this.swap = (sx, sy, nx, ny) => {
        let tmp = this.state[sx][sy];
        this.state[sx][sy] = this.state[nx][ny];
        this.state[nx][ny] = tmp;
    }
    
    this.print = () => {
        let str = "";
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++) {
                str += this.state[i][j];
            }
        console.log(str);
    }
}

function init() {
    let cnt_b = 0;
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
            let id = "s" + (++cnt_b);
            let inputVal = document.getElementById(id).value;
            if (inputVal == "") inputVal = 0;
            startArray[i][j] = parseInt(inputVal);
        }
    cnt_b = 0;
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
            let id = "e" + (++cnt_b);
            let inputVal = document.getElementById(id).value;
            if (inputVal == "") inputVal = 0;
            endArray[i][j] = parseInt(inputVal);
        }
    console.log("initiated successfully");
}

function reset(_id) {
    let cnt_b = 0;
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
            let id = _id + (++cnt_b);
            if (document.getElementById(id).value != "")
                document.getElementById(id).value= "";
        }
    console.log("reset successfully!");
}

function check(_id) {
    let cnt_b = 0;
    let vis = new Array(9);
    for (let i = 0; i < 9; i++) vis[i] = 0;
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
            let id = _id + (++cnt_b);
            let inputVal = document.getElementById(id).value;
            if (inputVal == "") inputVal = 0;
            let tmp = parseInt(inputVal);
            if (!(0 <= tmp && tmp <= 8)) {
                if (_id == "s") alert("initial state ilegal input!");
                else alert("final state ilegal input!");
                return false;
            }
            vis[tmp]++;
            if (vis[tmp] > 1) {
                if (_id == "s") alert("initial state ilegal input!");
                else alert("final state ilegal input!");
                return false;
            }
        }
    return true;
}

function getSpacePos(curBoard) {
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            if (curBoard.state[i][j] == 0)
                return {x : i, y : j};
    alert("error occurs when getting space!");
}

function getSolution(pre, endHash, solution) {
    let curHashVal = endHash;
    while (curHashVal != undefined) {
        let tmp = curHashVal.toString();
        if (tmp.length != 9) tmp = "0" + tmp;
        solution.push(tmp);
        curHashVal = pre.get(curHashVal);
    }
}

//ullurddruulldrrdllurrd
function aStar(sx, sy, solution) { // A*
    let startBoard = new Board(startArray, 0);
    let endBoard = new Board(endArray, 0);

    let dx = [0, 1, 0, -1], dy = [1, 0, -1, 0];

    let dis = new Map(), pre = new Map();
    //https://www.npmjs.com/package/js-priority-queue
    let q = new PriorityQueue({ comparator: function(boarda, boardb) { return boarda.eval - boardb.eval; }});
    
    q.queue(startBoard);
    dis.set(startBoard.hashVal, 0);

    while (q.length > 0) {
        let curBoard = q.dequeue();
        let curS = getSpacePos(curBoard); // 找到空格所在位置
        // console.log(curBoard.hashVal, curS.x, curS.y);
        // curBoard.print();

        if (curBoard.hashVal == endBoard.hashVal) { // 到达最终状态
            getSolution(pre, endBoard.hashVal, solution); // 寻找路径
            console.log("search Finished!");
            return dis.get(curBoard.hashVal);
        }
        
        for (let dir = 0; dir < 4; dir++) { // 遍历 4 个方向
            let nx = curS.x + dx[dir], ny = curS.y + dy[dir];
            if (nx < 0 || nx > 2 || ny < 0 || ny > 2) continue;

            // curBoard.print();
            curBoard.swap(curS.x, curS.y, nx, ny);
            // curBoard.print();
            let nxtBoard = new Board(curBoard.state, dis.get(curBoard.hashVal));
            // nxtBoard.print();
            // console.log("....");

            if ((dis.get(nxtBoard.hashVal) == undefined) || dis[nxtBoard.hashVal] > dis[curBoard.hashVal] + 1) {
                dis.set(nxtBoard.hashVal, dis.get(curBoard.hashVal) + 1);
                pre.set(nxtBoard.hashVal, curBoard.hashVal);
                q.queue(nxtBoard);
            }

            curBoard.swap(curS.x, curS.y, nx, ny);
        }
    }
    console.log("search Finished!");
    return -1;
}

function getNodePos(node) {
    let tmp = node, left = node.offsetLeft, top = node.offsetTop;
    while (tmp = tmp.offsetParent) {
        left += tmp.offsetLeft;
        top += tmp.offsetTop;
    }
    return [left, top];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function displaySolution(solution) { // 演示最短路径
    if (solution.length <= 1) return;
    (function myLoop(i) {
        setTimeout(() => {
            sleep(1000).then(() => {
                let id1 = "s" + solution[i].indexOf("0");
                let id2 = "s" + solution[i - 1].indexOf("0");
                console.log(i, id1 + id2);
                // let node1 = document.getElementById(id1);
                // let node2 = document.getElementById(id2);
                // let [x1, y1] = getNodePos(node1);
                // let [x2, y2] = getNodePos(node2);
                if ((--i) >= 1) myLoop(i);
            });
        }, 500);
    })(solution.length - 1);
}

document.getElementById("calc-button").addEventListener('click', () => { // 检查输入并计算
    if (check("s") && check("e")) {
        init();
        let solution = new Array();
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++) 
                if (startArray[i][j] == "0") {
                    console.log(aStar(i, j, solution));
                    console.log(solution.length);
                    displaySolution(solution);
                    break;
                }
        delete solution;
    }
});

document.getElementById("inputs-button").onclick = function() { // 初始状态清空
    reset("s");
}

document.getElementById("inpute-button").onclick = function() { // 莫状态清空
    reset("e");
}