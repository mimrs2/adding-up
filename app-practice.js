'use strict';
// fs は、FileSystem（ファイルシステム）の略で、ファイルを扱うためのモジュールです。
const fs = require('fs');
// readline は、ファイルを一行ずつ読み込むためのモジュールです。
const readline = require('readline');

// popu-pref.csv ファイルから、ファイルを読み込みを行う Stream（ストリーム）を生成し、 
// さらにそれを readline オブジェクトの input として設定し、 rl オブジェクトを作成しています。
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト


// rl オブジェクトで line というイベントが発生したら この無名関数を呼んでください、という意味です。
rl.on('line', (lineString) => {
    // この行は、引数 lineString で与えられた文字列をカンマ, で分割して、それを columns という名前の配列にしています。
    // たとえば、"ab,cde,f" という文字列であれば、["ab", "cde", "f"]という文字列からなる配列に分割されます。
    const columns = lineString.split(',');
    // parseInt() （パースイント）という関数が使われています。これは文字列を整数値に変換する関数です。
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                // 変化率
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});
// 'close' イベントは、全ての行を読み込み終わった際に呼び出されます。
// これは初めて見る書き方だと思いますが、for-of 構文といいます。
// Map や Array の中身を of の前に与えられた変数に代入して for ループと同じことができます。
// 配列に含まれる要素を使いたいだけで、添字は不要な場合に便利です。
rl.on('close', () => {
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    // 連想配列を普通の配列に変換する処理をおこなっています。
    // sortに比較関数を渡して降順に並び替えている
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair1[1].change - pair2[1].change;
    });
    // map関数：Array の要素それぞれを、与えられた関数を適用した内容に変換
    const rankingStrings = rankingArray.map(([key, value], i) => {
        return (i + 1) + "位" + key + ":" + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change;
    });
    console.log(rankingStrings);
});