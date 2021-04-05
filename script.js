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

var running = false;

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
    running = true;
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
}

function errorMsg(msg) {
    swal({
        title: `${msg}`,
        icon: "error",
    });
}

function successMsg(msg) {
    swal({
        title: `${msg}`,
        icon: "success",
    });
}

function warnMsg(msg) {
    swal({
        title: `${msg}`,
        icon: "warning",
    });
}

function reset(_id) {
    document.getElementById("step-num").innerHTML = "?";
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
                if (_id == "s") errorMsg("请检查初始状态输入!");
                else errorMsg("请检查最终状态输入!");
                return false;
            }
            vis[tmp]++;
            if (vis[tmp] > 1) {
                if (_id == "s") errorMsg("请检查初始状态输入!");
                else errorMsg("请检查最终状态输入!");
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


async function displaySolution(solution) { // 演示最短路径
    document.getElementById("step-num").innerHTML = solution.length - 1;
    if (solution.length <= 1) {
        running = false;
        setTimeout(() => {
            successMsg("求解完成!");
        }, 1000);
        return;
    }
    (function myLoop(i) {
        setTimeout(() => {
            document.getElementById("step-num").innerHTML = i - 1;
            let id1 = "s" + (solution[i].indexOf("0") + 1);
            let id2 = "s" + (solution[i - 1].indexOf("0") + 1);

            //console.log(i, id1 + id2);

            let node1 = document.getElementById(id1);
            let node2 = document.getElementById(id2);

            let new1 = document.createElement("input");
            new1.type = "text";
            new1.id = id1;
            new1.value = node2.value;

            let new2 = document.createElement("input");
            new2.type = "text";
            new2.id = id2;
            new2.value = node1.value;
            new2.style.cssText = node1.style.cssText;
                
            let faId1 = "srow" + (Math.floor(solution[i].indexOf("0") / 3) + 1);
            let faId2 = "srow" + (Math.floor(solution[i - 1].indexOf("0") / 3) + 1);

            document.getElementById(faId1).replaceChild(new1, node1);
            document.getElementById(faId2).replaceChild(new2, node2);

            if ((--i) >= 1) myLoop(i);
            else {
                running = false;
                setTimeout(() => {
                    successMsg("求解完成!");
                }, 1000);
            }
        }, 1000);
    })(solution.length - 1);
}

function focusSpace(id) {
    document.getElementById(id).style.cssText = `border: 0.4rem solid #fff; background-color: rgb(243, 233, 223);`;
}

document.getElementById("calc-button").addEventListener('click', () => { // 检查输入并计算
    if (running) {
        warnMsg("求解中，请稍后重试");
        return;
    }
    if (check("s") && check("e")) {
        init();
        let solution = new Array();
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++) 
                if (startArray[i][j] == "0") {
                    console.log(aStar(i, j, solution));
                    console.log(solution.length);
                    if (solution.length == 0) {
                        errorMsg("该输入下无解");
                        running = false;
                    } else {
                        swal({
                            title: `找到最佳解法，需${solution.length-1}步得到最终状态`,
                            icon: "success",
                        }).then(() => {
                            focusSpace("s" + (i * 3 + j + 1));
                            displaySolution(solution);
                        });
                    }
                    break;
                }
    }
});

document.getElementById("inputs-button").addEventListener('click', () => { // 初始状态清空
    if (running) {
        warnMsg("求解中，请稍后重试");
        return;
    }
    reset("s");
});

document.getElementById("inpute-button").addEventListener('click', () => { // 莫状态清空
    if (running) {
        warnMsg("求解中，请稍后重试");
        return;
    }
    reset("e");
});

document.getElementById("reset-button").addEventListener('click', () => { // 莫状态清空
    if (running) {
        swal("确认重置?", {
            buttons: {
                cancel: "No",
                yes: {
                    text: "OK",
                    value: "reset",
                },
            },
            icon: "warning",
        }).then((value) => {
            switch (value) {
                case "reset":
                    location.reload();
                    break;
            }
        });
        return;
    }
    location.reload();
});